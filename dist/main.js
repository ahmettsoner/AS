#!/usr/bin/env node
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs_1 = require("fs");
const path_1 = require("path");
const BranchManager_1 = require("./modules/BranchManager");
const packageJson = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, "../package.json"), "utf8"));
const program = new commander_1.Command();
program
    .name((_a = packageJson.name) !== null && _a !== void 0 ? _a : "Git Release Manager")
    .description((_b = packageJson.description) !== null && _b !== void 0 ? _b : "Tools to manage your git releases and versioning")
    .version((_c = packageJson.version) !== null && _c !== void 0 ? _c : "0.0.0", "-v, --version", "Show the current version number")
    .helpOption("-h, --help", "Display help information");
const programPhase = program
    .command("phase")
    .description("");
programPhase.addCommand(new commander_1.Command()
    .command("dev")
    .alias("d")
    .description("Determine version")
    .action((commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const options = Object.assign(Object.assign({}, program.opts()), commandOptions);
    const branchManager = new BranchManager_1.BranchManager();
    const determinedVersion = yield branchManager.DetermineDevPhaseVersion("dev", options);
    if (determinedVersion) {
        console.log(determinedVersion.replace("\n", ""));
    }
})));
programPhase.addCommand(new commander_1.Command()
    .command("test")
    .alias("t")
    .description("Determine version")
    .addArgument(new commander_1.Argument("<channel>", "Specify the channel"))
    .addArgument(new commander_1.Argument("<version>", "Specify the version"))
    .action((channel, version, commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const options = Object.assign(Object.assign({}, program.opts()), commandOptions);
    const branchManager = new BranchManager_1.BranchManager();
    const determinedVersion = yield branchManager.DetermineTestPhaseVersion(channel, version, options);
    if (determinedVersion) {
        console.log(determinedVersion.replace("\n", ""));
    }
})));
const programTag = program
    .command("tag")
    .description("");
programTag.addCommand(new commander_1.Command()
    .command("list")
    .alias("l")
    .description("List release branches")
    .addArgument(new commander_1.Argument("branch"))
    .action((branch, commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const options = Object.assign(Object.assign({}, program.opts()), commandOptions);
    const branchManager = new BranchManager_1.BranchManager();
    const existingTags = yield branchManager.ListBranchTags(branch);
    console.log(existingTags);
})));
programTag.addCommand(new commander_1.Command()
    .command("latest")
    .description("Get latest branch tag")
    .addArgument(new commander_1.Argument("<branch>", "Specify the branch"))
    .addOption(new commander_1.Option('-p, --print <type>', 'Print option can be full, base, channel, or left empty')
    .choices(["full", "base", "channel", "build"])
    .default(""))
    .action((branch, commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const options = Object.assign(Object.assign({}, program.opts()), commandOptions);
    const branchManager = new BranchManager_1.BranchManager();
    const latestBranch = yield branchManager.latestBranchTag(branch, options);
    console.log(latestBranch);
})));
const programRelease = program
    .command("release")
    .description("");
programRelease.addCommand(new commander_1.Command()
    .command("list")
    .alias("l")
    .description("List release branches")
    .addArgument(new commander_1.Argument("channel"))
    .action((channel, commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const options = Object.assign(Object.assign({}, program.opts()), commandOptions);
    const branchManager = new BranchManager_1.BranchManager();
    const existingReleaseBranches = yield branchManager.listReleaseBranches(channel);
    console.log(existingReleaseBranches);
})));
programRelease.addCommand(new commander_1.Command()
    .command("latest")
    .description("Get latest release branch")
    .addArgument(new commander_1.Argument("<channel>", "Specify the channel"))
    .addOption(new commander_1.Option('-p, --print <type>', 'Print option can be full, base, channel, or left empty')
    .choices(["full", "base", "channel", "build"])
    .default(""))
    .action((channel, commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const options = Object.assign(Object.assign({}, program.opts()), commandOptions);
    const branchManager = new BranchManager_1.BranchManager();
    const latestBranch = yield branchManager.latestReleaseBranch(channel, options);
    console.log(latestBranch);
})));
programRelease.addCommand(new commander_1.Command()
    .command("create")
    .alias("c")
    .description("Create release branch")
    .addArgument(new commander_1.Argument("channel"))
    .addArgument(new commander_1.Argument("baseVersion"))
    .action((channel, baseVersion, commandOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const options = Object.assign(Object.assign({}, program.opts()), commandOptions);
    const branchManager = new BranchManager_1.BranchManager();
    yield branchManager.createReleaseBranch(channel, baseVersion);
})));
program.action(() => {
    console.log("Please specify a command or use --help for usage information");
    process.exit(1);
});
program.parse(process.argv);
//# sourceMappingURL=main.js.map