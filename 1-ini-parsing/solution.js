#!/usr/bin/env node
'use strict';

var argparse  = require('argparse');
var fs = require('fs');
var request = require('request');

var parser = new argparse.ArgumentParser({
    debug: true,
    formatterClass: argparse.ArgumentDefaultsHelpFormatter,
    description: 'description'
});

parser.addArgument(['source']);

var args = parser.parseArgs();

var toJSON = function(ini){
    ini = "" + ini;
    var json = "";
    var arrayOfLines = ini.match(/[^\r\n]+/g);
    arrayOfLines.forEach(function(line){
        line = line.trim();

        //if not a comment
        if(line[0] != ";"){
            //trim pairs
            line = line.split('=').map(function(key){
                return '"' + key.trim() + '"';
            }).join(":");

            line = line.replace('"[','}, "');
            line = line + ', ';
            line = line.replace(']", ','": {');
            json = json + line;
        }
    });
    json = "{" + json.substring(3, json.length-2) + "}}";
    json = json.split(', }').join("}");
    return json;
};

var toINI = function(json){
    var ini = "";
    json = JSON.parse(json);
    for(var key in json){
        ini += "[" + key + "]\n";
        for(var value in json[key]){
            ini += value + "=" + json[key][value]+"\n";
        }
    }
    return ini;
};

var source = args.source;
if(source != undefined){
    fs.readFile(source, function(err, data){
        if(source.indexOf("http") == -1) {
            //get the filename without the extension
            var extension = source.substring(source.indexOf("."));
            var outputFile = source.substring(0, source.indexOf("."));
            if (extension === ".json") {
                fs.writeFile(outputFile + ".ini", toINI(data));
            } else {
                fs.writeFile(outputFile + ".json", toJSON(data));
            }
        } else {
            request({'url':source}, function (error, response, body) {
                fs.writeFile('config.json', toJSON(body));
            });
        }
    })
}
