import simpleGit, { SimpleGit } from 'simple-git'
import semver from 'semver'

/*
Burda akış sonra ki step'e merge edilmemiş olan en son version'u işleyecek şekilde kuvvetlendiilmeli
*/
export class BranchManager {
    private readonly git: SimpleGit = simpleGit()
    private readonly defaultBaseVersion = '1.0.0'

    getVersionPart(version: string, options: any): string {


        const parsedVersion = semver.parse(version)
        if (!parsedVersion) {
            return ''
        }

        if(options.print){
            switch (options.print) {
                case 'base':
                    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`
                case 'channel':
                    return `${parsedVersion.prerelease.join('.')}`
                case 'build':
                    return `${parsedVersion.prerelease[1]?.toString()}` || ''
                default:
                    return parsedVersion.version
            }
        }
        return parsedVersion.version;

    }

    async listBranchTags(branch: string, channel: string | null = null): Promise<string[]> {
        try {
            // Run `git tag --merged <branch>` to get all tags merged into the branch
            const tags = await this.git.raw(['tag', '--merged', branch]);
    
            
            let tagPattern = `v[0-9]*\\.[0-9]*\\.[0-9]`; // Escape dots for regex
            if (channel) {
                tagPattern += `-${channel}\\.[0-9]*`;
            }

            const regexPattern = tagPattern.replace(/\\\*/g, '.*').replace(/\\\./g, '\\.');
            const regex = new RegExp(`^${regexPattern}$`);
    
            // Split the result into lines, trim each, and filter using the regex
            const tagList = tags
                .split('\n')
                .map((tag: string) => tag.trim())
                .filter(tag => regex.test(tag));
    
            return tagList;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listing error: ${error.message}`);
            } else {
                console.error('Tag listing error: Unknown error type');
            }
            return [];
        }
    }

    async latestBranchTag(branch: string, channel: string | null = null): Promise<string> {
        try {
            const tagList = await this.listBranchTags(branch, channel)

            if (!tagList) {
                return ''
            }

            const latestTag = tagList.filter(tag => semver.valid(tag)).sort(semver.rcompare)[0]

            return latestTag;

        } catch (error) {
            console.error('Could not retrieve tags:', error instanceof Error ? error.message : error)
            return ''
        }
    }
    
    async latestTagVersion(branch: string, channel: string | null = null, baseVersion: string | null = null): Promise<string> {
        try {
            // Construct the channel version string
            const channelVersion = channel ? `${baseVersion}-${channel}` : baseVersion;
    
            // List all tags that match the given branch and channel
            const matchingTags = await this.listBranchTags(branch, channel);
    
            // Filter tags using the regex
            let filteredTags = matchingTags;
            if(channelVersion){
                filteredTags = matchingTags?.filter(tag => tag.startsWith(channelVersion)) || [];
            }
    
            // Sort filtered tags using semver to find the latest version
            const latestTag = filteredTags.sort(semver.rcompare)[0];
    
            if (!latestTag) {
                return '';
            }
    
            const parsedVersion = semver.parse(latestTag);
            return parsedVersion ? latestTag : '';
        } catch (error) {
            console.error('Could not retrieve tags:', error instanceof Error ? error.message : error);
            return '';
        }
    }

    async listReleaseBranches(channel: string | null = null): Promise<string[]> {
        try {
            // Construct the branch pattern with the correct glob
            let branchPattern = `release/v[0-9]*\\.[0-9]*\\.[0-9]*`; // Escape dots for regex
            if (channel) {
                branchPattern += `-${channel}`;
            }
    
            // Use git to list branches using the pattern
            const result = await this.git.raw(['branch', '--list', branchPattern]);
    
            // Construct a regex to only match the exact branch names with the constructed pattern
            const regexPattern = branchPattern.replace(/\\\*/g, '.*').replace(/\\\./g, '\\.');
            const regex = new RegExp(`^${regexPattern}$`);
    
            // Trim and filter the branches
            const branches = result
                .split('\n')
                .map(line => line.replace('*', '').trim())
                .filter(line => regex.test(line)); // Filter using the exact regex
    
            return branches;
        } catch (error) {
            console.error(`Error listing branches: ${error}`);
            return [];
        }
    }

    async latestReleaseBranchVersion(channel: string | null = null): Promise<string> {
        try {
            const branchList = await this.listReleaseBranches(channel)

            const latestBranch = branchList
                .map(branch => branch.replace(/^release\/v/, ''))
                .filter(tag => semver.valid(tag))
                .sort(semver.rcompare)[0]

            if (!latestBranch) {
                return ''
            }

            const parsedVersion = semver.parse(latestBranch)
            if (!parsedVersion) {
                return ''
            }

            return `v${latestBranch}`
        } catch (error) {
            console.error('Could not retrieve tags:', error)
            return ''
        }
    }

    async createReleaseBranch(branchName: string, baseVersion: string): Promise<void> {
        try {
            // Define the new branch name using the base version and the branch name
            const releaseBranchName = `release/v${baseVersion}-${branchName}`

            // Check out the base version (or branch) from which you want to create the new branch
            await this.git.checkoutLocalBranch(baseVersion)

            // Create the new release branch from the base version
            await this.git.checkoutBranch(releaseBranchName, baseVersion)
        } catch (error) {
            console.error(`Failed to create release branch: ${error}`)
        }
    }

    async DetermineDevPhaseVersion(branch: string, options?: any) {
        // Burda dev, alpha release branch'ten ileri ise ve değişiklik varsa kontrolü de olmalı (commit, diff, version)
        try {
            const channel = 'dev'

            let hasAnyAlphaRelease = true
            let latestReleaseBranchVersion = await this.latestReleaseBranchVersion('alpha')
            if (!latestReleaseBranchVersion) {
                latestReleaseBranchVersion = this.defaultBaseVersion
                hasAnyAlphaRelease = false
            }else {
                latestReleaseBranchVersion = this.getVersionPart(latestReleaseBranchVersion, { print: 'base' })
            }
            const baseVersion = `v${latestReleaseBranchVersion}`
            const latestChannelTagVersion = await this.latestTagVersion(branch, channel, baseVersion)
            
            let result = ''
            if (options.next) {
                // eğer ilk sürümse ve alpha release yoksa
                if (!hasAnyAlphaRelease) {
                    // eğer ilk sürüm ve dev channel yoksa
                    if (!latestChannelTagVersion) {
                        result = `v${this.defaultBaseVersion}-${channel}.1`
                    } else {
                        const incrementedVersion = semver.inc(latestChannelTagVersion, 'prerelease', channel)
                        result = `v${incrementedVersion}`
                    }
                } else {
                    // Compare release version with dev version
                    if (!latestChannelTagVersion || semver.gt(latestReleaseBranchVersion, latestChannelTagVersion)) {
                        // If release version is greater, bump the minor version from release version
                        const newBaseVersion = semver.inc(latestReleaseBranchVersion, 'minor')
                        result = `v${newBaseVersion}-${channel}.1`
                    } else {
                        // Otherwise increment the channel number of the latest dev version
                        const incrementedDevVersion = semver.inc(latestChannelTagVersion, 'prerelease', channel)
                        result = `v${incrementedDevVersion}`
                    }
                }
            } else if (options.current) {
                if (!latestChannelTagVersion) {
                    result = `${baseVersion}-${channel}.1`
                } else {
                    result = latestChannelTagVersion
                }
            }

            return `v${this.getVersionPart(result, options)}`;

        } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listeleme hatası: ${error.message}`)
            } else {
                console.error('Tag listeleme hatası: Bilinmeyen hata türü')
            }
        }
    }
    async DetermineTestPhaseVersion(channel: string, baseVersion?: string, options?: any) {
        try {
            if (!baseVersion) {
                let latestReleaseBranchBaseVersion = await this.latestReleaseBranchVersion(channel)
                if (!latestReleaseBranchBaseVersion) {
                    latestReleaseBranchBaseVersion = this.defaultBaseVersion
                }else{
                    latestReleaseBranchBaseVersion = this.getVersionPart(latestReleaseBranchBaseVersion, { print: 'base' })
                }
                baseVersion = `v${latestReleaseBranchBaseVersion}`
            }
            const latestChannelTagVersion = await this.latestTagVersion(`release/${baseVersion}-${channel}`, channel, baseVersion)
            // const latestChannelTagVersion = await this.latestReleaseBranchChannelTag(baseVersion, channel)

            let result = ''
            if (options.next) {
                if (!latestChannelTagVersion) {
                    result = `${baseVersion}-${channel}.1`
                } else {
                    const incrementedVersion = semver.inc(latestChannelTagVersion, 'prerelease', channel)
                    result = `v${incrementedVersion}`
                }
            } else if (options.nextRelease) {
                if (!latestChannelTagVersion) {
                    result = `${baseVersion}-${channel}.1`
                } else {
                    const incrementedVersion = semver.inc(baseVersion, 'minor')
                    result = `v${incrementedVersion}-${channel}.1`
                }
            } else if (options.current) {
                if (!latestChannelTagVersion) {
                    result = `${baseVersion}-${channel}.1`
                } else {
                    result = latestChannelTagVersion
                }
            }

            return `v${this.getVersionPart(result, options)}`;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listeleme hatası: ${error.message}`)
            } else {
                console.error('Tag listeleme hatası: Bilinmeyen hata türü')
            }
        }
    }
    async DetermineStagePhaseVersion(channel: string, baseVersion: string, options?: any) {
        try {
            if (!baseVersion) {
                let latestReleaseBranchBaseVersion = await this.latestReleaseBranchVersion(channel)
                if (!latestReleaseBranchBaseVersion) {
                    latestReleaseBranchBaseVersion = this.defaultBaseVersion
                }else {
                    latestReleaseBranchBaseVersion = this.getVersionPart(latestReleaseBranchBaseVersion, { print: 'base' })
                }
                baseVersion = `v${latestReleaseBranchBaseVersion}`
            }
            const latestChannelTagVersion = await this.latestTagVersion(`release/${baseVersion}-${channel}`, channel, baseVersion)
            // const latestChannelTagVersion = await this.latestReleaseBranchChannelTag(baseVersion, channel)

            let result = ''
            if (options.next) {
                if (!latestChannelTagVersion) {
                    result = `${baseVersion}-${channel}.1`
                } else {
                    const incrementedVersion = semver.inc(latestChannelTagVersion, 'prerelease', channel)
                    result = `v${incrementedVersion}`
                }
            } else if (options.nextRelease) {
                if (!latestChannelTagVersion) {
                    result = `${baseVersion}-${channel}.1`
                } else {
                    const incrementedVersion = semver.inc(baseVersion, 'minor')
                    result = `v${incrementedVersion}-${channel}.1`
                }
            } else if (options.current) {
                if (!latestChannelTagVersion) {
                    result = `${baseVersion}-${channel}.1`
                } else {
                    result = latestChannelTagVersion
                }
            }

            return `v${this.getVersionPart(result, options)}`;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listeleme hatası: ${error.message}`)
            } else {
                console.error('Tag listeleme hatası: Bilinmeyen hata türü')
            }
        }
    }
    async DetermineProductionPhaseVersion(channelName: string, baseVersion: string, options?: any) {
        try {
            let latestStableReleaseBranchBaseVersion = null
            if (!baseVersion) {
                let latestReleaseBranchBaseVersion = await this.latestReleaseBranchVersion(channelName)
                latestReleaseBranchBaseVersion = this.getVersionPart(latestReleaseBranchBaseVersion, { print: 'base' })
                if (!latestReleaseBranchBaseVersion) {
                    latestReleaseBranchBaseVersion = this.defaultBaseVersion
                }
                latestStableReleaseBranchBaseVersion = await this.latestReleaseBranchVersion()
                latestStableReleaseBranchBaseVersion = this.getVersionPart(latestStableReleaseBranchBaseVersion, { print: 'base' })
                if (!latestStableReleaseBranchBaseVersion) {
                    baseVersion = this.defaultBaseVersion
                }else{
                    baseVersion = `v${latestStableReleaseBranchBaseVersion}`
                }
            }
            const latestChannelTagVersion = await this.latestTagVersion(`release/${baseVersion}`, null, baseVersion)
            const channel = 'final'

            let result = ''
            if (options.next) {
                if (!latestChannelTagVersion) {
                    result = `${baseVersion}`
                } else {
                    result = `${latestChannelTagVersion}`
                }
            } else if (options.nextRelease) {
                if (!latestChannelTagVersion && !latestStableReleaseBranchBaseVersion) {
                    result = `${baseVersion}`
                } else {
                    const incrementedVersion = semver.inc(baseVersion, 'minor')
                    result = `v${incrementedVersion}`
                }
            } else if (options.nextFix) {
                if (!latestChannelTagVersion && !latestStableReleaseBranchBaseVersion) {
                    result = `${baseVersion}`
                } else {
                    const incrementedVersion = semver.inc(baseVersion, 'patch')
                    result = `v${incrementedVersion}`
                }
            } else if (options.current) {
                if (!latestChannelTagVersion) {
                    result = `${baseVersion}`
                } else {
                    result = latestChannelTagVersion
                }
            } else if (options.previous) {
                result = await this.latestTagVersion(`main`)
            } else if (options.previousFix) {
                    const latestMainVersion = await this.latestTagVersion(`main`)
                    const incrementedVersion = semver.inc(latestMainVersion, 'patch')
                    result = `v${incrementedVersion}`
            }

            return `v${this.getVersionPart(result, options)}`;
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listeleme hatası: ${error.message}`)
            } else {
                console.error('Tag listeleme hatası: Bilinmeyen hata türü')
            }
        }
    }
}
