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
        default: true,
        store: true
      },
      {
        type: "input",
        name: "hostName",
        message: "What is the hostname of the server?",
        store: true
      },
      {
        type: "input",
        name: "namespace",
        message: "What is the namespace on GitLab?",
        store: true
      },
      {
        type: "number",
        name: "projectId",
        message: "What is the Project ID on GitLab?",
        store: true
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
      this.destinationRoot(".");
      const jhipsterPackage = this.fs.readJSON("package.json");
      const jhipsterConfig = this.fs.readJSON(".yo-rc.json");
      if (
        jhipsterConfig &&
        jhipsterConfig["generator-jhipster"] &&
        jhipsterConfig["generator-jhipster"].baseName
      ) {
        this.props.baseName = jhipsterConfig["generator-jhipster"].baseName;
        this.props.frontend =
          jhipsterConfig["generator-jhipster"].applicationType !==
          "microservice";
        this.props.react =
          jhipsterConfig["generator-jhipster"].applicationType === "react";
        this.props.projectUrl = jhipsterConfig["generator-jhipster"].url
          ? jhipsterConfig["generator-jhipster"].url
          : "http://localhost:9000";
        this.props.description =
          jhipsterPackage && jhipsterPackage.description
            ? jhipsterPackage.description
            : "JHipster";
      } else {
        this.props.error = `${chalk.red("Here is not a JHipster folder!")}`;
      }
    });
  }

  writing() {
    if (!this.props.error) {
      if (this.props.react) {
        this.fs.copyTpl(
          this.templatePath("script/docker-polling.ejs"),
          this.destinationPath("script/polling.sh"),
          {
            baseName: this.props.baseName,
            namespace: this.props.namespace,
            environment: this.props.prod ? "production" : "staging",
            projectUrl: this.props.projectUrl
          }
        );
      } else {
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
          this.templatePath("script/test.ejs"),
          this.destinationPath("src/main/script/test.sh"),
          {
            projectId: this.props.projectId,
            environment: this.props.prod ? "production" : "staging",
            frontend: this.props.frontend
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

        this.fs.copyTpl(
          this.templatePath("script/deploy.ejs"),
          this.destinationPath("src/main/script/deploy.sh"),
          {
            projectId: this.props.projectId,
            environment: this.props.prod ? "production" : "staging"
          }
        );

        this.fs.copy(
          this.templatePath("script/setup.sh"),
          this.destinationPath("src/main/script/setup.sh")
        );

        this.fs.copy(
          this.templatePath("script/watchdog.sh"),
          this.destinationPath("src/main/script/watchdog.sh")
        );

        this.fs.copy(
          this.templatePath("script/git-polling.sh"),
          this.destinationPath("src/main/script/polling.sh")
        );
      }

      this.fs.copyTpl(
        this.templatePath("script/gitlab-runner.ejs"),
        this.destinationPath(
          `${this.props.react ? "" : "src/main/"}script/gitlab-runner.sh`
        ),
        {
          baseName: this.props.baseName,
          description: this.props.description
        }
      );
    }
  }

  install() {
    if (this.props.error) this.log(this.props.error);
    else this.log(`Done! Execute ${chalk.red("make")} for options!`);
  }
};
