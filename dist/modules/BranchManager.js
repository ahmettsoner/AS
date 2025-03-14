"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchManager = void 0;
const simple_git_1 = __importDefault(require("simple-git"));
const semver_1 = __importDefault(require("semver"));
class BranchManager {
    constructor() {
        this.git = (0, simple_git_1.default)();
    }
    ListBranchTags(branch) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // `git tag --merged <branch>` komutunu çalıştır
                const tags = yield this.git.raw(['tag', '--merged', branch]);
                // Gelen veriyi satırlara böl ve boş satırları temizle
                const tagList = tags.split('\n').filter(tag => tag.trim() !== '');
                return tagList;
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`Tag listeleme hatası: ${error.message}`);
                }
                else {
                    console.error("Tag listeleme hatası: Bilinmeyen hata türü");
                }
            }
        });
    }
    latestBranchTag(branch, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tagList = yield this.ListBranchTags(branch);
                if (!tagList) {
                    return '';
                }
                const latestTag = tagList
                    .filter(tag => semver_1.default.valid(tag))
                    .sort(semver_1.default.rcompare)[0];
                if (!latestTag) {
                    return '';
                }
                const parsedVersion = semver_1.default.parse(latestTag);
                if (!parsedVersion) {
                    return '';
                }
                if (!options) {
                    return latestTag;
                }
                switch (options.print) {
                    case "base":
                        return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
                    case "channel":
                        return parsedVersion.prerelease.join('.');
                    case "build":
                        return ((_a = parsedVersion.prerelease[1]) === null || _a === void 0 ? void 0 : _a.toString()) || '';
                    default:
                        return latestTag;
                }
            }
            catch (error) {
                console.error('Could not retrieve tags:', error instanceof Error ? error.message : error);
                return "";
            }
        });
    }
    latestChannelTag(branch, channel, baseVersion, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tagList = yield this.ListBranchTags(branch);
                if (!tagList) {
                    return '';
                }
                const latestTag = tagList //v1.0.0-dev.1
                    .filter(tag => {
                    let result = semver_1.default.valid(tag);
                    if (result) {
                        if (!tag.startsWith(`v${baseVersion}-${channel}`)) {
                            result = null;
                        }
                    }
                    return result;
                })
                    .sort(semver_1.default.rcompare)[0];
                if (!latestTag) {
                    return '';
                }
                const parsedVersion = semver_1.default.parse(latestTag);
                if (!parsedVersion) {
                    return '';
                }
                if (!options) {
                    return latestTag;
                }
                switch (options.print) {
                    case "base":
                        return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
                    case "channel":
                        return parsedVersion.prerelease.join('.');
                    case "build":
                        return ((_a = parsedVersion.prerelease[1]) === null || _a === void 0 ? void 0 : _a.toString()) || '';
                    default:
                        return latestTag;
                }
            }
            catch (error) {
                console.error('Could not retrieve tags:', error instanceof Error ? error.message : error);
                return "";
            }
        });
    }
    latestReleaseBranch(channel, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const branchList = yield this.listReleaseBranches(channel);
                const latestBranch = branchList
                    .map(branch => branch.replace(/^release\/v/, ''))
                    .filter(tag => semver_1.default.valid(tag))
                    .sort(semver_1.default.rcompare)[0];
                if (!latestBranch) {
                    return '';
                }
                const parsedVersion = semver_1.default.parse(latestBranch);
                if (!parsedVersion) {
                    return '';
                }
                if (!options) {
                    return latestBranch;
                }
                switch (options.print) {
                    case "base":
                        return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
                    case "channel":
                        return `${parsedVersion.prerelease.join('.')}`;
                    case "build":
                        return (_a = parsedVersion.prerelease[1]) === null || _a === void 0 ? void 0 : _a.toString();
                    default:
                        return latestBranch;
                }
            }
            catch (error) {
                console.error('Could not retrieve tags:', error);
                return "";
            }
        });
    }
    latestReleaseTag(channel, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const branchList = yield this.listReleaseBranches(channel);
                const latestBranch = branchList
                    .map(branch => branch.replace(/^release\/v/, ''))
                    .filter(tag => semver_1.default.valid(tag))
                    .sort(semver_1.default.rcompare)[0];
                if (!latestBranch) {
                    return '';
                }
                const parsedVersion = semver_1.default.parse(latestBranch);
                if (!parsedVersion) {
                    return '';
                }
                if (!options) {
                    return latestBranch;
                }
                switch (options.print) {
                    case "base":
                        return `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
                    case "channel":
                        return `${parsedVersion.prerelease.join('.')}`;
                    case "build":
                        return (_a = parsedVersion.prerelease[1]) === null || _a === void 0 ? void 0 : _a.toString();
                    default:
                        return latestBranch;
                }
            }
            catch (error) {
                console.error('Could not retrieve tags:', error);
                return "";
            }
        });
    }
    listReleaseBranches(branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Use the raw method to execute the git branch command with a glob pattern
                const branchPattern = `release/v[0-9]*.[0-9]*.0-${branchName}`;
                const result = yield this.git.raw(['branch', '--list', branchPattern]);
                // Split the result into lines and trim each line to remove extra whitespace or newlines
                const branches = result.split('\n')
                    .map(line => line.replace('*', '').trim()).filter(line => line !== '');
                return branches;
            }
            catch (error) {
                console.error(`Error listing branches: ${error}`);
                return [];
            }
        });
    }
    createReleaseBranch(branchName, baseVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Define the new branch name using the base version and the branch name
                const releaseBranchName = `release/v${baseVersion}-${branchName}`;
                // Check out the base version (or branch) from which you want to create the new branch
                yield this.git.checkoutLocalBranch(baseVersion);
                // Create the new release branch from the base version
                yield this.git.checkoutBranch(releaseBranchName, baseVersion);
            }
            catch (error) {
                console.error(`Failed to create release branch: ${error}`);
            }
        });
    }
    DetermineDevPhaseVersion(branch, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const latestReleaseBranchVersion = yield this.latestReleaseBranch("alpha", { print: "base" });
                const latestDevTagVersion = yield this.latestBranchTag(branch);
                // eğer ilk sürümse ve alpha release yoksa
                if (!latestReleaseBranchVersion) {
                    // eğer ilk sürüm ve dev channel yoksa
                    if (!latestDevTagVersion) {
                        return "v1.0.0-dev.1";
                    }
                    else {
                        const incrementedVersion = semver_1.default.inc(latestDevTagVersion, 'prerelease', "dev");
                        return `v${incrementedVersion}`;
                    }
                }
                else {
                    // Compare release version with dev version
                    if (!latestDevTagVersion || semver_1.default.gt(latestReleaseBranchVersion, latestDevTagVersion)) {
                        // If release version is greater, bump the minor version from release version
                        const newBaseVersion = semver_1.default.inc(latestReleaseBranchVersion, 'minor');
                        return `v${newBaseVersion}-dev.1`;
                    }
                    else {
                        // Otherwise increment the channel number of the latest dev version
                        const incrementedDevVersion = semver_1.default.inc(latestDevTagVersion, 'prerelease', 'dev');
                        return `v${incrementedDevVersion}`;
                    }
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`Tag listeleme hatası: ${error.message}`);
                }
                else {
                    console.error("Tag listeleme hatası: Bilinmeyen hata türü");
                }
            }
        });
    }
    DetermineTestPhaseVersion(channel, baseVersion, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const latestChannelTagVersion = yield this.latestChannelTag(`release/${baseVersion}-${channel}`, channel, baseVersion);
                if (!latestChannelTagVersion) {
                    return `v1.0.0-${channel}.1`;
                }
                else {
                    const incrementedVersion = semver_1.default.inc(latestChannelTagVersion, 'prerelease', channel);
                    return `v${incrementedVersion}`;
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error(`Tag listeleme hatası: ${error.message}`);
                }
                else {
                    console.error("Tag listeleme hatası: Bilinmeyen hata türü");
                }
            }
        });
    }
}
exports.BranchManager = BranchManager;
//# sourceMappingURL=BranchManager.js.map