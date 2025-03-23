import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process'
import { join } from 'path'
import fs from 'fs'
import simpleGit, { SimpleGit } from 'simple-git'
import { cleanupTestProject, createEmptyTestWorkspace } from '../../projectSetup'

describe('E2E: Flow Strategy', () => {
    const E2E_DIR = join(__dirname, '../../../../temp/test/e2e/flow/strategy')
    let git: SimpleGit

    const setupTest = async (project_dir: string) => {
        await createEmptyTestWorkspace(project_dir, {
            withGit: true,
            withNpm: true,
            withGitHub: true,
        })
        git = simpleGit(project_dir)
        await git.checkoutLocalBranch('main')
    }

    afterAll(async () => {
        await cleanupTestProject(E2E_DIR)
    })

    test('Full sample', async () => {
        const PROJECT_DIR = join(E2E_DIR, `full-sample`)
        await setupTest(PROJECT_DIR)
        const cmdOptions: ExecSyncOptionsWithStringEncoding = {
            cwd: PROJECT_DIR,
            encoding: 'utf8',
        }


        //iteration 1
        execSync('git checkout -b dev', cmdOptions).trim()

        const setupFeatureBranchDevelopAndCommit = (featureName: string) => {
            execSync(`git checkout -b feature/${featureName}`, cmdOptions).trim()
            fs.writeFileSync(join(PROJECT_DIR, `${featureName}-readme.md`), `${featureName} implementation`)
            execSync('git add .', cmdOptions).trim()
            execSync(`git commit -m "feat: ${featureName}"`, cmdOptions).trim()
            execSync('git checkout dev', cmdOptions).trim()
            execSync(`git merge feature/${featureName} --no-ff`, cmdOptions).trim()
            execSync(`git branch -d feature/${featureName}`, cmdOptions).trim()
        }

        const tagDevRelease = (expectedVersion: string) => {
            const firstDevReleaseVersionOutput = execSync('pm phase dev --next', cmdOptions).trim()
            expect(firstDevReleaseVersionOutput).toEqual(expectedVersion)
            execSync(`git tag -a ${firstDevReleaseVersionOutput} -m "Dev release ${firstDevReleaseVersionOutput}"`, cmdOptions).trim()
        }


        const moveDevelopmentToTestPhase = (channel :string, expectedBaseVersion: string, expectedVersion: string) => {
            const secondIterationAlphaBaseVersion = execSync(`pm phase test ${channel} --next-release --print=base`, cmdOptions).trim()
            expect(secondIterationAlphaBaseVersion).toEqual(expectedBaseVersion)
            execSync(`git checkout -b release/${secondIterationAlphaBaseVersion}-${channel} dev`, cmdOptions).trim()
            const secondIterationAlphaVersion = execSync(`pm phase test ${channel} --next`, cmdOptions).trim()
            expect(secondIterationAlphaVersion).toEqual(expectedVersion)
            execSync(`git tag -a ${secondIterationAlphaVersion} -m "${channel} release ${secondIterationAlphaVersion}"`, cmdOptions).trim()
            execSync('git checkout dev', cmdOptions).trim()
        }

        
        const setupFixBranchDevelopAndCommit = (fixname: string, baseVersion: string, channel: string) => {
            execSync(`git checkout release/${baseVersion}-${channel}`, cmdOptions).trim()
            execSync(`git checkout -b hot-fix/${fixname}`, cmdOptions).trim()
            fs.writeFileSync(join(PROJECT_DIR, `readme-${fixname}.md`), `${fixname} added`)
            execSync('git add .', cmdOptions).trim()
            execSync(`git commit -m "doc: ${fixname}"`, cmdOptions).trim()
            execSync(`git checkout release/${baseVersion}-${channel}`, cmdOptions).trim()
            execSync(`git merge hot-fix/${fixname} --no-ff`, cmdOptions).trim()
            execSync('git checkout dev', cmdOptions).trim()
            execSync(`git merge hot-fix/${fixname} --no-ff`, cmdOptions).trim()
            execSync(`git checkout release/${baseVersion}-${channel}`, cmdOptions).trim()
            execSync(`git branch -d hot-fix/${fixname}`, cmdOptions).trim()
        }

        const tagTestRelease = (channel :string, expectedVersion: string) => {
            const secondIterationAlphaSecondVersion = execSync(`pm phase test ${channel} --next`, cmdOptions).trim()
            expect(secondIterationAlphaSecondVersion).toEqual(expectedVersion)
            execSync(`git tag -a ${secondIterationAlphaSecondVersion} -m "Alpha release ${secondIterationAlphaSecondVersion}"`, cmdOptions).trim()
            execSync('git checkout dev', cmdOptions).trim()
        }

        
        const moveTestPhaseToStagePhase = (testChannel :string, channel: string, expectedBaseVersion: string, expectedVersion: string) => {
            const thirdIterationBetaBaseVersion = execSync(`pm phase stage ${channel} --next-release --print=base`, cmdOptions).trim()
            expect(thirdIterationBetaBaseVersion).toEqual(expectedBaseVersion)
            execSync(`git checkout -b release/${thirdIterationBetaBaseVersion}-${channel} release/${thirdIterationBetaBaseVersion}-${testChannel}`, cmdOptions).trim()
            const thirdIterationBetaVersion = execSync(`pm phase test ${channel} --next`, cmdOptions).trim()
            expect(thirdIterationBetaVersion).toEqual(expectedVersion)
            execSync(`git tag -a ${thirdIterationBetaVersion} -m "${channel} release ${thirdIterationBetaVersion}"`, cmdOptions).trim()
            execSync('git checkout dev', cmdOptions).trim()
        }

        
        const moveStagePhaseToProductionPhase = (stageChannel :string, expectedVersion: string) => {
            const thirdIterationBetaBaseVersion = execSync(`pm phase production --next-release --print=base`, cmdOptions).trim()
            expect(thirdIterationBetaBaseVersion).toEqual(expectedVersion)
            execSync(`git checkout -b release/${thirdIterationBetaBaseVersion} release/${thirdIterationBetaBaseVersion}-${stageChannel}`, cmdOptions).trim()
            const thirdIterationBetaVersion = execSync(`pm phase production --next`, cmdOptions).trim()
            expect(thirdIterationBetaVersion).toEqual(expectedVersion)
            execSync(`git tag -a ${thirdIterationBetaVersion} -m "stabil release ${thirdIterationBetaVersion}"`, cmdOptions).trim()
            execSync('git checkout dev', cmdOptions).trim()
        }

        // Iteration 1
        setupFeatureBranchDevelopAndCommit("add-new-api")
        tagDevRelease("v1.0.0-dev.1")
        setupFeatureBranchDevelopAndCommit("add-new-api2")
        tagDevRelease("v1.0.0-dev.2")


        //iteration 2 
        moveDevelopmentToTestPhase("alpha", "v1.0.0", "v1.0.0-alpha.1")

        setupFeatureBranchDevelopAndCommit("add-new-api3")
        setupFeatureBranchDevelopAndCommit("add-new-api4")
        tagDevRelease("v1.1.0-dev.1")

        setupFixBranchDevelopAndCommit("api-doc-1", "v1.0.0", "alpha")
        tagTestRelease("alpha", "v1.0.0-alpha.2")


        //iteration 3 
        moveTestPhaseToStagePhase("alpha", "beta", "v1.0.0", "v1.0.0-beta.1")
        moveDevelopmentToTestPhase("alpha", "v1.1.0", "v1.1.0-alpha.1")

        setupFeatureBranchDevelopAndCommit("add-new-api5")
        tagDevRelease("v1.2.0-dev.1")

        
        setupFixBranchDevelopAndCommit("api-doc-2", "v1.1.0", "alpha")
        tagTestRelease("alpha", "v1.1.0-alpha.2")

        setupFixBranchDevelopAndCommit("api-doc-3", "v1.0.0", "beta")
        tagTestRelease("beta", "v1.0.0-beta.2")


        //iteration 4
        moveStagePhaseToProductionPhase("beta", "v1.0.0")
        

        moveTestPhaseToStagePhase("alpha", "beta", "v1.1.0", "v1.1.0-beta.1")
        moveDevelopmentToTestPhase("alpha", "v1.2.0", "v1.2.0-alpha.1")

        setupFeatureBranchDevelopAndCommit("add-new-api6")
        tagDevRelease("v1.3.0-dev.1")

        
        setupFixBranchDevelopAndCommit("api-doc-4", "v1.2.0", "alpha")
        tagTestRelease("alpha", "v1.2.0-alpha.2")

        setupFixBranchDevelopAndCommit("api-doc-5", "v1.1.0", "beta")
        tagTestRelease("beta", "v1.1.0-beta.2")

    })
})
