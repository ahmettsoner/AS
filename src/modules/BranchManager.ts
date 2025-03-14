import simpleGit, { SimpleGit, TagResult } from "simple-git";
import semver from 'semver'

export class BranchManager {
    private readonly git: SimpleGit = simpleGit();
    
    async ListBranchTags(branch: string) {
        try {
            // `git tag --merged <branch>` komutunu çalıştır
            const tags = await this.git.raw(['tag', '--merged', branch]);
    
            // Gelen veriyi satırlara böl ve boş satırları temizle
            const tagList = tags.split('\n').filter(tag => tag.trim() !== '');
    
            return tagList;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listeleme hatası: ${error.message}`);
            } else {
                console.error("Tag listeleme hatası: Bilinmeyen hata türü");
            }
        }
    }

    async latestBranchTag(branch: string, options?: any): Promise<string> {
        try {
            const tagList = await this.ListBranchTags(branch);

            if (!tagList) {
                return '';
            }

            const latestTag = 
                tagList
                    .filter(tag => semver.valid(tag))
                    .sort(semver.rcompare)[0];

            if (!latestTag) {
                return '';
            }

            const parsedVersion = semver.parse(latestTag);
            if (!parsedVersion) {
                return '';
            }

            if(!options){
                return latestTag
            }

            switch (options.print) {
                case "base":
                    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
                case "channel":
                    return parsedVersion.prerelease.join('.');
                case "build":
                    return parsedVersion.prerelease[1]?.toString() || '';
                default:
                    return latestTag;
            }
        } catch (error) {
            console.error('Could not retrieve tags:', error instanceof Error ? error.message : error);
            return "";
        }
    }

   

    async latestReleaseBranch(channel: string, options?: any): Promise<string> {
        try {
            const branchList = await this.listReleaseBranches(channel);

            const latestBranch =
                branchList
                    .map(branch => branch.replace(/^release\/v/, ''))
                    .filter(tag => semver.valid(tag))
                    .sort(semver.rcompare)[0];

            if (!latestBranch) {
                return '';
            }

            const parsedVersion = semver.parse(latestBranch);
            if (!parsedVersion) {
                return '';
            }

            if(!options){
                return latestBranch
            }

            switch (options.print) {
                case "base":
                    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
                case "channel":
                    return `${parsedVersion.prerelease.join('.')}`;
                case "build":
                    return parsedVersion.prerelease[1]?.toString();
                default:
                    return latestBranch;
            }
        } catch (error) {
            console.error('Could not retrieve tags:', error);
            return "";
        }
    }
    async latestReleaseTag(channel: string, options?: any): Promise<string> {
        try {
            const branchList = await this.listReleaseBranches(channel);

            const latestBranch =
                branchList
                    .map(branch => branch.replace(/^release\/v/, ''))
                    .filter(tag => semver.valid(tag))
                    .sort(semver.rcompare)[0];

            if (!latestBranch) {
                return '';
            }

            const parsedVersion = semver.parse(latestBranch);
            if (!parsedVersion) {
                return '';
            }

            if(!options){
                return latestBranch
            }

            switch (options.print) {
                case "base":
                    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
                case "channel":
                    return `${parsedVersion.prerelease.join('.')}`;
                case "build":
                    return parsedVersion.prerelease[1]?.toString();
                default:
                    return latestBranch;
            }
        } catch (error) {
            console.error('Could not retrieve tags:', error);
            return "";
        }
    }

    async latestReleaseBranchChannelTag(channel: string, baseVersion: string, options?: any): Promise<string> {
        try {
            const branchList = await this.listReleaseBranches(channel);

            const latestBranch =
                branchList
                    .map(branch => branch.replace(/^release\/v/, ''))
                    .filter(tag => semver.valid(tag))
                    .sort(semver.rcompare)[0];

            if (!latestBranch) {
                return '';
            }

            const parsedVersion = semver.parse(latestBranch);
            if (!parsedVersion) {
                return '';
            }

            if(!options){
                return latestBranch
            }

            switch (options.print) {
                case "base":
                    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
                case "channel":
                    return `${parsedVersion.prerelease.join('.')}`;
                case "build":
                    return parsedVersion.prerelease[1]?.toString();
                default:
                    return latestBranch;
            }
        } catch (error) {
            console.error('Could not retrieve tags:', error);
            return "";
        }
    }

    
    async listReleaseBranches(branchName: string): Promise<string[]> {
        try {
            // Use the raw method to execute the git branch command with a glob pattern
            const branchPattern = `release/v[0-9]*.[0-9]*.0-${branchName}`;
            const result = await this.git.raw(['branch', '--list', branchPattern]);
            
            // Split the result into lines and trim each line to remove extra whitespace or newlines
            const branches = result.split('\n')
            .map(line => line.replace('*', '').trim()).filter(line => line !== '');
            
            return branches;
        } catch (error) {
            console.error(`Error listing branches: ${error}`);
            return [];
        }
    }
    async createReleaseBranch(branchName: string, baseVersion: string): Promise<void> {
        try {
            // Define the new branch name using the base version and the branch name
            const releaseBranchName = `release/v${baseVersion}-${branchName}`;

            // Check out the base version (or branch) from which you want to create the new branch
            await this.git.checkoutLocalBranch(baseVersion);

            // Create the new release branch from the base version
            await this.git.checkoutBranch(releaseBranchName, baseVersion);
        } catch (error) {
            console.error(`Failed to create release branch: ${error}`);
        }
    }


    async DetermineDevPhaseVersion(branch: string, options?: any) {
        try {
            const latestReleaseBranchVersion = await this.latestReleaseBranch("alpha", {print: "base"})
            const latestDevTagVersion = await this.latestBranchTag(branch)

            // eğer ilk sürümse ve alpha release yoksa
            if (!latestReleaseBranchVersion){

                // eğer ilk sürüm ve dev channel yoksa
                if(!latestDevTagVersion){
                    return "v1.0.0-dev.1"
                }else{
                    const incrementedVersion = semver.inc(latestDevTagVersion, 'prerelease', "dev");
                    return `v${incrementedVersion}`;
                }
            }else{
                // Compare release version with dev version
                if (!latestDevTagVersion || semver.gt(latestReleaseBranchVersion, latestDevTagVersion)) {
                    // If release version is greater, bump the minor version from release version
                    const newBaseVersion = semver.inc(latestReleaseBranchVersion, 'minor');
                    return `v${newBaseVersion}-dev.1`;
                } else {
                    // Otherwise increment the channel number of the latest dev version
                    const incrementedDevVersion = semver.inc(latestDevTagVersion, 'prerelease', 'dev');
                    return `v${incrementedDevVersion}`;
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listeleme hatası: ${error.message}`);
            } else {
                console.error("Tag listeleme hatası: Bilinmeyen hata türü");
            }
        }
    }
    async DetermineTestPhaseVersion(channel: string, baseVersion: string, options?: any) {
        try {
            const latestChannelTagVersion = await this.latestReleaseBranchChannelTag(channel, baseVersion)

            if(!latestChannelTagVersion){
                return `v1.0.0-${channel}.1`
            }else{
                const incrementedVersion = semver.inc(latestChannelTagVersion, 'prerelease', channel);
                return `v${incrementedVersion}`;
            }
    } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listeleme hatası: ${error.message}`);
            } else {
                console.error("Tag listeleme hatası: Bilinmeyen hata türü");
            }
        }
    }


}