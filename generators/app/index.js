"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

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
        type: "input",
        name: "hostName",
        message: "What is the hostname of the server?"
      },
      {
        type: "input",
        name: "namespace",
        message: "What is the namespace on GitLab?"
      },
      {
        type: "number",
        name: "projectId",
        message: "What is the Project ID on GitLab?"
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
      this.fs.copyTpl(
        this.templatePath("makefile.ejs"),
        this.destinationPath("Makefile"),
        {
          baseName: this.props.baseName,
          hostName: this.props.hostName,
          profiles: this.props.prod ? "prod" : "dev,IDE,swagger"
        }
      );

      this.fs.copyTpl(
        this.templatePath("script/build.ejs"),
        this.destinationPath("src/main/script/build.sh"),
        {
          baseName: this.props.baseName,
          namespace: this.props.namespace,
          projectId: this.props.projectId
        }
      );
    }
  }

  install() {
    if (this.props.error) this.log(this.props.error);
    else this.log(`Done! Execute ${chalk.red("make")} for options!`);
  }
};