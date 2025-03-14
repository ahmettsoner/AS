import { execSync } from 'child_process'
import { join } from 'path'
import simpleGit, { SimpleGit } from 'simple-git'
import { cleanupTestProject, createEmptyTestWorkspace } from '../../projectSetup'

// With first test release (alpha)
describe('E2E: Iteration Scenario Iteration 3', () => {
    const E2E_DIR = join(__dirname, '../../../temp/test/e2e/scenario/iteration-3')
    let git: SimpleGit

    const setupTest = async(project_dir:string) => {
        await createEmptyTestWorkspace(project_dir, {
            withGit: true,
            withNpm: true,
            withGitHub: true
        });
        git = simpleGit(project_dir)
    }


    afterAll(async () => {
        await cleanupTestProject(E2E_DIR)
    })

    test('First Dev Tag', async () => {
        const PROJECT_DIR = join(E2E_DIR, `first-dev-tag`);
        await setupTest(PROJECT_DIR)

        await git.checkoutLocalBranch("release/v1.0.0-alpha")
        await git.checkoutLocalBranch("release/v1.1.0-alpha")
        await git.checkoutLocalBranch("dev")

        const expectedVersion = 'v1.2.0-dev.1'

        const versionOutput = execSync('pm phase dev', {
            cwd: PROJECT_DIR,
            encoding: 'utf8',
        }).trim()
        expect(versionOutput).toEqual(expectedVersion)
    })

    test('Second Dev Tag', async () => {
        const PROJECT_DIR = join(E2E_DIR, `second-dev-tag`);
        await setupTest(PROJECT_DIR)

        await git.checkoutLocalBranch("release/v1.0.0-alpha")
        await git.checkoutLocalBranch("release/v1.1.0-alpha")
        await git.checkoutLocalBranch("dev")
        await git.addTag('v1.0.0-dev.1')
        await git.addTag('v1.1.0-dev.1')
        await git.addTag('v1.1.0-dev.2')
        await git.addTag('v1.1.0-dev.3')
        await git.addTag('v1.2.0-dev.1')

        const expectedVersion = 'v1.2.0-dev.2'

        const versionOutput = execSync('pm phase dev', {
            cwd: PROJECT_DIR,
            encoding: 'utf8',
        }).trim()
        expect(versionOutput).toEqual(expectedVersion)
    })

    test('Third Dev Tag', async () => {
        const PROJECT_DIR = join(E2E_DIR, `third-dev-tag`);
        await setupTest(PROJECT_DIR)

        await git.checkoutLocalBranch("release/v1.0.0-alpha")
        await git.checkoutLocalBranch("release/v1.1.0-alpha")
        await git.checkoutLocalBranch("dev")
        await git.addTag('v1.0.0-dev.1')
        await git.addTag('v1.1.0-dev.1')
        await git.addTag('v1.1.0-dev.2')
        await git.addTag('v1.1.0-dev.3')
        await git.addTag('v1.2.0-dev.1')
        await git.addTag('v1.2.0-dev.2')

        const expectedVersion = 'v1.2.0-dev.3'

        const versionOutput = execSync('pm phase dev', {
            cwd: PROJECT_DIR,
            encoding: 'utf8',
        }).trim()
        expect(versionOutput).toEqual(expectedVersion)
    })

    test('1 iteration stale Dev Tag', async () => {
        const PROJECT_DIR = join(E2E_DIR, `stale-1-iteration`);
        await setupTest(PROJECT_DIR)

        await git.checkoutLocalBranch("dev")
        await git.addTag('v1.0.0-dev.1')
        await git.checkoutLocalBranch("release/v1.0.0-alpha")
        await git.checkoutLocalBranch("release/v1.1.0-alpha")

        const expectedVersion = 'v1.2.0-dev.1'

        const versionOutput = execSync('pm phase dev', {
            cwd: PROJECT_DIR,
            encoding: 'utf8',
        }).trim()
        expect(versionOutput).toEqual(expectedVersion)
    })

    test('2 iteration stale Dev Tag', async () => {
        const PROJECT_DIR = join(E2E_DIR, `stale-2-iteration`);
        await setupTest(PROJECT_DIR)

        await git.checkoutLocalBranch("dev")
        await git.addTag('v1.0.0-dev.1')
        await git.checkoutLocalBranch("release/v1.0.0-alpha")
        await git.checkoutLocalBranch("release/v1.1.0-alpha")

        const expectedVersion = 'v1.2.0-dev.1'

        const versionOutput = execSync('pm phase dev', {
            cwd: PROJECT_DIR,
            encoding: 'utf8',
        }).trim()
        expect(versionOutput).toEqual(expectedVersion)
    })



    test('First Alpha Tag', async () => {
        const PROJECT_DIR = join(E2E_DIR, `first-alpha-tag`);
        await setupTest(PROJECT_DIR)

        await git.checkoutLocalBranch("release/v1.0.0-alpha")
        await git.addTag('v1.0.0-alpha.1')
        await git.addTag('v1.0.0-alpha.2')
        await git.checkoutLocalBranch("release/v1.1.0-alpha")

        const expectedVersion = 'v1.1.0-alpha.1'

        const versionOutput = execSync('pm phase test alpha v1.1.0', {
            cwd: PROJECT_DIR,
            encoding: 'utf8',
        }).trim()
        expect(versionOutput).toEqual(expectedVersion)
    })

    test('Second Alpha Tag', async () => {
        const PROJECT_DIR = join(E2E_DIR, `second-alpha-tag`);
        await setupTest(PROJECT_DIR)

        await git.checkoutLocalBranch("release/v1.0.0-alpha")
        await git.addTag('v1.0.0-alpha.1')

        const expectedVersion = 'v1.0.0-alpha.2'

        const versionOutput = execSync('pm phase test alpha v1.0.0', {
            cwd: PROJECT_DIR,
            encoding: 'utf8',
        }).trim()
        expect(versionOutput).toEqual(expectedVersion)
    })

    test('Third Alpha Tag', async () => {
        const PROJECT_DIR = join(E2E_DIR, `third-alpha-tag`);
        await setupTest(PROJECT_DIR)

        await git.checkoutLocalBranch("release/v1.0.0-alpha")
        await git.addTag('v1.0.0-alpha.1')
        await git.addTag('v1.0.0-alpha.2')

        const expectedVersion = 'v1.0.0-alpha.3'

        const versionOutput = execSync('pm phase test alpha v1.0.0', {
            cwd: PROJECT_DIR,
            encoding: 'utf8',
        }).trim()
        expect(versionOutput).toEqual(expectedVersion)
    })
})