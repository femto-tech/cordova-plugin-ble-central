var fs = require('fs');

var podExtraSettings = `
# use_frameworks!

pre_install do |installer|
  puts "##### pre_install start #####"
  installer.analysis_result.specifications.each do |s|
    s.swift_version = '4.2' unless s.swift_version
  end
  puts "##### pre_install end #####"
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_VERSION'] = '4.2'
      config.build_settings['ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES'] = 'Yes'
    end
  end
end
`;

fs.appendFile('platforms/ios/Podfile', podExtraSettings, function (err, data) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
