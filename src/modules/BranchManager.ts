import simpleGit, { SimpleGit } from 'simple-git'
import semver from 'semver'

export class BranchManager {
    private readonly git: SimpleGit = simpleGit()
    private readonly defaultBaseVersion = '1.0.0'

    async ListBranchTags(branch: string) {
        try {
            // Validate that the branch exists
            const branches = await this.git.branch(['--list', branch])
            if (!branches.all.includes(branch)) {
                console.error(`Branch does not exist: ${branch}`)
                return []
            }

            // `git tag --merged <branch>` komutunu çalıştır
            const tags = await this.git.raw(['tag', '--merged', branch])

            // Gelen veriyi satırlara böl ve boş satırları temizle
            const tagList = tags.split('\n').filter(tag => tag.trim() !== '')

            return tagList
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listeleme hatası: ${error.message}`)
            } else {
                console.error('Tag listeleme hatası: Bilinmeyen hata türü')
            }
        }
    }

    async latestBranchTag(branch: string, options?: any): Promise<string> {
        try {
            const tagList = await this.ListBranchTags(branch)

            if (!tagList) {
                return ''
            }

            const latestTag = tagList.filter(tag => semver.valid(tag)).sort(semver.rcompare)[0]

            if (!latestTag) {
                return ''
            }

            const parsedVersion = semver.parse(latestTag)
            if (!parsedVersion) {
                return ''
            }

            if (!options) {
                return latestTag
            }

            switch (options.print) {
                case 'base':
                    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`
                case 'channel':
                    return parsedVersion.prerelease.join('.')
                case 'build':
                    return parsedVersion.prerelease[1]?.toString() || ''
                default:
                    return latestTag
            }
        } catch (error) {
            console.error('Could not retrieve tags:', error instanceof Error ? error.message : error)
            return ''
        }
    }
    async latestDevBranchChannelTag(branch: string, channel: string, baseVersion: string, options?: any): Promise<string> {
        try {
            // List all branches matching the given channel
            let channelVersion = baseVersion
            if (channel) {
                channelVersion = `${baseVersion}-${channel}`
            }

            const channelReleaseBranchName = branch;
            const matchingTags = await this.ListBranchTags(channelReleaseBranchName)

            // Filter parsed tags based on base version and channel
            const filteredTags = matchingTags!.filter(tag => {
                const parsedVersion = semver.parse(tag)
                return parsedVersion && parsedVersion.raw.startsWith(channelVersion)
            })

            // Sort by version to get the latest
            const latestTag = filteredTags.sort(semver.rcompare)[0]

            if (!latestTag) {
                return ''
            }

            const parsedVersion = semver.parse(latestTag)
            if (!parsedVersion) {
                return ''
            }

            // Determine what to return based on options
            if (!options) {
                return latestTag
            }

            switch (options.print) {
                case 'base':
                    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`
                case 'channel':
                    return `${parsedVersion.prerelease.join('.')}`
                case 'build':
                    return parsedVersion.prerelease[1]?.toString() || ''
                default:
                    return latestTag
            }
        } catch (error) {
            console.error('Could not retrieve tags:', error instanceof Error ? error.message : error)
            return ''
        }
    }

    async latestReleaseBranch(channel: string, options?: any): Promise<string> {
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

            if (!options) {
                return latestBranch
            }

            switch (options.print) {
                case 'base':
                    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`
                case 'channel':
                    return `${parsedVersion.prerelease.join('.')}`
                case 'build':
                    return parsedVersion.prerelease[1]?.toString()
                default:
                    return latestBranch
            }
        } catch (error) {
            console.error('Could not retrieve tags:', error)
            return ''
        }
    }
    async latestReleaseTag(channel: string, options?: any): Promise<string> {
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

            if (!options) {
                return latestBranch
            }

            switch (options.print) {
                case 'base':
                    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`
                case 'channel':
                    return `${parsedVersion.prerelease.join('.')}`
                case 'build':
                    return parsedVersion.prerelease[1]?.toString()
                default:
                    return latestBranch
            }
        } catch (error) {
            console.error('Could not retrieve tags:', error)
            return ''
        }
    }

    async latestReleaseBranchChannelTag(baseVersion: string, channel?: string, options?: any): Promise<string> {
        try {
            // List all branches matching the given channel
            let channelVersion = baseVersion
            if (channel) {
                channelVersion = `${baseVersion}-${channel}`
            }

            const channelReleaseBranchName = `release/${channelVersion}`
            const matchingTags = await this.ListBranchTags(channelReleaseBranchName)

            // Filter parsed tags based on base version and channel
            const filteredTags = matchingTags!.filter(tag => {
                const parsedVersion = semver.parse(tag)
                return parsedVersion && parsedVersion.raw.startsWith(channelVersion)
            })

            // Sort by version to get the latest
            const latestTag = filteredTags.sort(semver.rcompare)[0]

            if (!latestTag) {
                return ''
            }

            const parsedVersion = semver.parse(latestTag)
            if (!parsedVersion) {
                return ''
            }

            // Determine what to return based on options
            if (!options) {
                return latestTag
            }

            switch (options.print) {
                case 'base':
                    return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`
                case 'channel':
                    return `${parsedVersion.prerelease.join('.')}`
                case 'build':
                    return parsedVersion.prerelease[1]?.toString() || ''
                default:
                    return latestTag
            }
        } catch (error) {
            console.error('Could not retrieve tags:', error instanceof Error ? error.message : error)
            return ''
        }
    }

    async listReleaseBranches(branchName: string): Promise<string[]> {
        try {
            // Use the raw method to execute the git branch command with a glob pattern
            const branchPattern = `release/v[0-9]*.[0-9]*.0-${branchName}`
            const result = await this.git.raw(['branch', '--list', branchPattern])

            // Split the result into lines and trim each line to remove extra whitespace or newlines
            const branches = result
                .split('\n')
                .map(line => line.replace('*', '').trim())
                .filter(line => line !== '')

            return branches
        } catch (error) {
            console.error(`Error listing branches: ${error}`)
            return []
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
        try {
            const channel = 'dev'

            let hasAnyAlphaRelease = true
            let latestReleaseBranchBaseVersion = await this.latestReleaseBranch('alpha', { print: 'base' })
            if (!latestReleaseBranchBaseVersion) {
                latestReleaseBranchBaseVersion = this.defaultBaseVersion
                hasAnyAlphaRelease = false
            }
            const baseVersion = `v${latestReleaseBranchBaseVersion}`
            const latestChannelTagVersion = await this.latestDevBranchChannelTag(branch, channel, baseVersion)
            
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
                    if (!latestChannelTagVersion || semver.gt(latestReleaseBranchBaseVersion, latestChannelTagVersion)) {
                        // If release version is greater, bump the minor version from release version
                        const newBaseVersion = semver.inc(latestReleaseBranchBaseVersion, 'minor')
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

            if (options.print) {
                switch (options.print) {
                    case 'base':
                        // Remove the channel and all following parts to get the base version
                        return result.replace(new RegExp(`-${channel}\\.\\d+$`), '')
                    case 'channel':
                        // Simply return the channel as it is
                        return channel
                    case 'build':
                        // Extract the number following 'channel' and return it
                        const buildMatch = result.match(new RegExp(`-${channel}\\.(\\d+)$`))
                        return buildMatch ? buildMatch[1] : ''
                    default:
                        return result
                }
            } else {
                return result
            }
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
                let latestReleaseBranchBaseVersion = await this.latestReleaseBranch(channel, { print: 'base' })
                if (!latestReleaseBranchBaseVersion) {
                    latestReleaseBranchBaseVersion = this.defaultBaseVersion
                }
                baseVersion = `v${latestReleaseBranchBaseVersion}`
            }
            const latestChannelTagVersion = await this.latestReleaseBranchChannelTag(baseVersion, channel)

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

            if (options.print) {
                switch (options.print) {
                    case 'base':
                        // Remove the channel and all following parts to get the base version
                        return result.replace(new RegExp(`-${channel}\\.\\d+$`), '')
                    case 'channel':
                        // Simply return the channel as it is
                        return channel
                    case 'build':
                        // Extract the number following 'channel' and return it
                        const buildMatch = result.match(new RegExp(`-${channel}\\.(\\d+)$`))
                        return buildMatch ? buildMatch[1] : ''
                    default:
                        return result
                }
            } else {
                return result
            }
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
                let latestReleaseBranchBaseVersion = await this.latestReleaseBranch(channel, { print: 'base' })
                if (!latestReleaseBranchBaseVersion) {
                    latestReleaseBranchBaseVersion = this.defaultBaseVersion
                }
                baseVersion = `v${latestReleaseBranchBaseVersion}`
            }
            const latestChannelTagVersion = await this.latestReleaseBranchChannelTag(baseVersion, channel)

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

            if (options.print) {
                switch (options.print) {
                    case 'base':
                        // Remove the channel and all following parts to get the base version
                        return result.replace(new RegExp(`-${channel}\\.\\d+$`), '')
                    case 'channel':
                        // Simply return the channel as it is
                        return channel
                    case 'build':
                        // Extract the number following 'channel' and return it
                        const buildMatch = result.match(new RegExp(`-${channel}\\.(\\d+)$`))
                        return buildMatch ? buildMatch[1] : ''
                    default:
                        return result
                }
            } else {
                return result
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listeleme hatası: ${error.message}`)
            } else {
                console.error('Tag listeleme hatası: Bilinmeyen hata türü')
            }
        }
    }
    async DetermineProductionPhaseVersion(latestReleaseChannel: string, baseVersion: string, options?: any) {
        try {
            if (!baseVersion) {
                let latestReleaseBranchBaseVersion = await this.latestReleaseBranch(latestReleaseChannel, { print: 'base' })
                if (!latestReleaseBranchBaseVersion) {
                    latestReleaseBranchBaseVersion = this.defaultBaseVersion
                }
                baseVersion = `v${latestReleaseBranchBaseVersion}`
            }
            const latestChannelTagVersion = await this.latestReleaseBranchChannelTag(baseVersion)
            const channel = 'final'

            let result = ''
            if (options.next) {
                if (!latestChannelTagVersion) {
                    result = `${baseVersion}`
                } else {
                    const incrementedVersion = semver.inc(latestChannelTagVersion, 'minor')
                    result = `v${incrementedVersion}`
                }
            }

            
            // let result = ''
            // if (options.next) {
            //     if (!latestChannelTagVersion) {
            //         result = `${baseVersion}-${channel}.1`
            //     } else {
            //         const incrementedVersion = semver.inc(latestChannelTagVersion, 'prerelease', channel)
            //         result = `v${incrementedVersion}`
            //     }
            // } else if (options.nextRelease) {
            //     if (!latestChannelTagVersion) {
            //         result = `${baseVersion}-${channel}.1`
            //     } else {
            //         const incrementedVersion = semver.inc(baseVersion, 'minor')
            //         result = `v${incrementedVersion}-${channel}.1`
            //     }
            // } else if (options.current) {
            //     if (!latestChannelTagVersion) {
            //         result = `${baseVersion}-${channel}.1`
            //     } else {
            //         result = latestChannelTagVersion
            //     }
            // }

            if (options.print) {
                switch (options.print) {
                    case 'base':
                        // Remove the channel and all following parts to get the base version
                        return result
                    case 'channel':
                        // Simply return the channel as it is
                        return channel
                    default:
                        return result
                }
            } else {
                return result
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Tag listeleme hatası: ${error.message}`)
            } else {
                console.error('Tag listeleme hatası: Bilinmeyen hata türü')
            }
        }
    }
}
