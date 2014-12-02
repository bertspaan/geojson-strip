var fs = require('fs'),
    JSONStream = require('JSONStream'),
    es = require('event-stream'),
    optimist = require("optimist");

var argv = optimist
    .usage("Usage: \033[1mindex.js\033[0m [options] [file]\n\n"

+ "Removes all properties from all features in specified input GeoJSON file")

    .options("o", {
      alias: "out",
      describe: "output TopoJSON file name",
      default: "/dev/stdout"
    })
    .options("help", {
      describe: "display this helpful message",
      type: "boolean",
      default: false
    })
    .check(function(argv) {
      if (argv.help) return;
      if (argv._.length > 1) throw new Error("please specify a single input file");
      if (!argv._.length) argv._ = ["/dev/stdin"];
    })
    .argv;

if (argv.help) return optimist.showHelp();

var out = argv.o === "/dev/stdout"
    ? process.stdout
    : fs.createWriteStream(argv.o, "utf8");

var jsonStream = JSONStream.stringify("{\"type\":\"FeatureCollection\",\"features\":[", ",", "]}");

var input = argv._[0] === "/dev/stdin"
    ? process.stdin
    : fs.createReadStream(argv._[0], "utf8");

input
  .pipe(JSONStream.parse('features.*'))
  .pipe(es.mapSync(function (data) {
    data.properties = {};
    return data;
  }))
  .pipe(jsonStream)
  .pipe(out);
