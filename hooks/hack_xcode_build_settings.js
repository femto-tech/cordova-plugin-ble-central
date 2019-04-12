'use strict';

const xcode = require('xcode'),
      fs = require('fs'),
      replace = require('replace'),
      path = require('path');

module.exports = function(context) {
    const COMMENT_KEY = /_comment$/;
    var ConfigParser = context.requireCordovaModule('cordova-common/src/ConfigParser/ConfigParser');
    const projectRoot = context.opts.projectRoot;
    const platformPath = path.join(projectRoot, 'platforms', 'ios');
    const config = new ConfigParser(path.join(projectRoot, 'config.xml'));

    console.log('Running hook to modify Xcode settings');
    const projectName = config.name();

    const pbxprojPath = path.join(platformPath, projectName + '.xcodeproj', 'project.pbxproj');
    console.log("projectName:" + projectName);
    console.log("pbxprojPath:" + pbxprojPath);
    let xcodeProject = xcode.project(pbxprojPath);
    xcodeProject.parseSync();
    let buildConfigs = xcodeProject.pbxXCBuildConfigurationSection();

    let modified = false;
    for (let configName in buildConfigs) {
      if (!COMMENT_KEY.test(configName)) {
        let buildConfig = buildConfigs[configName];
        if (typeof xcodeProject.getBuildProperty('SWIFT_VERSION', buildConfig.name) === 'undefined') {
          xcodeProject.updateBuildProperty('SWIFT_VERSION', '4.2', buildConfig.name);
          console.log('Update SWIFT version to 4.2', buildConfig.name);
          modified = true;
        }
      }
    }
    if(modified) {
      fs.writeFileSync(pbxprojPath, xcodeProject.writeSync());
    }

    let patchBuildJs = path.join(platformPath, 'cordova','lib','build.js')
    console.log("patching build.js: " + patchBuildJs);
    fs.chmodSync(patchBuildJs,0o775)
    replace({regex: "[^/](.\-xcconfig.*xcconfig.*xcconfig)", replacement: "//$1", paths: [patchBuildJs]});
    replace({regex: "(customArgs.configuration_build_dir.*)(CONFIGURATION_BUILD_DIR)", replacement: "$1SYMROOT", paths: [patchBuildJs]});
    replace({regex: "[^/](customArgs.shared_precomps_dir)", replacement: "//$1", paths: [patchBuildJs]});

/*
    let patchZipSwift = path.join(platformPath, 'Pods','Zip','Zip','Zip.swift');
    console.log("patching zip.swift: " + patchZipSwift);
    fs.chmodSync(patchZipSwift,0o775)
    replace({regex: "(FileAttributeKey.creationDate) : ", replacement: "$1.rawValue :", paths: [patchZipSwift]});
    replace({regex: "(FileAttributeKey.modificationDate) : ", replacement: "$1.rawValue :", paths: [patchZipSwift]});
*/
}
