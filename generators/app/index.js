"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const ejs = require("ejs");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the amazing ${chalk.red("JHipster Makefile")} generator!`
      )
    );

    const prompts = [
      {
        type: "confirm",
        name: "prod",
        message: "Generate for a production environment?",
        default: true
      },
      {
        type: "text",
        name: "hostName",
        message: "What is the hostname of the server?"
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
      this.destinationRoot(".");
      const config = this.fs.readJSON(".yo-rc.json");
      if (
        config &&
        config["generator-jhipster"] &&
        config["generator-jhipster"].baseName
      )
        this.props.baseName = config["generator-jhipster"].baseName;
      else {
        this.props.error = `${chalk.red("Here is not a JHipster folder!")}`;
      }
    });
  }

  writing() {
    if (!this.props.error) {
      ejs.renderFile(
        this.templatePath("makefile.ejs"),
        {
          baseName: this.props.baseName,
          hostName: this.props.hostName,
          profiles: this.props.prod ? "prod" : "dev,IDE,swagger"
        },
        { filename: "Makefile" },
        (err, str) => {
          if (!err) this.fs.write(this.destinationPath("Makefile"), str);
        }
      );
    }
  }

  install() {
    if (this.props.error) this.log(this.props.error);
    else this.log(`Done! Execute ${chalk.red("make")} for options!`);
  }
};
