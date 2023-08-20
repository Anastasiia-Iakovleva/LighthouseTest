node {

        properties(

            [

                disableConcurrentBuilds(),

                buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '25', numToKeepStr: '25')),

                parameters([

                        choice(name: 'SCRIPT_TO_RUN', choices: 'Client_UI_test\nCoach_UI_test', description: 'Sitespeed script name'),

                        choice(name: 'ITERATIONS', choices: '1\n2\n3', description: 'Number of iterations' ),

                ])          

            ])

        stage('pulLatestCode'){

                git branch: 'main',

                url: 'https://github.com/Anastasiia-Iakovleva/LighthouseTest.git'

        }

        stage('preparation') {

                buildSucceeded = true        

                PWD=pwd()

                SCIPT = SCRIPT_TO_RUN  

                script{

                        DATE= String.format('%tF-%<tH-%<tM-%<tS'

                        , java.time.LocalDateTime.now())

                }

                RESULTS_DIR="testResults/${SCIPT}/${DATE}"

 

                DOCKER_CMD = "docker run --rm -v $WORKSPACE/testResults:$PWD/reports -w "$PWD" ibombit/lighthouse-puppeteer-chrome:latest node puppeteer.js --outputFolder ${RESULTS_DIR}-n ${ITERATIONS}" 

        }

        stage('runShell') {

                print "---------- Running tests ----------"

                 try {

                    bat DOCKER_CMD

                } catch (err) {

                    echo "Failed: ${err}"

                    buildSucceeded = false

                }

        }

        stage('copyResults') {

                bat "rsync -r ${PWD}/testResults/* /opt/sitespeed-result/"

        }

        stage('addLinkToBuildDescription') {

                script{

                        def URL = "http://13.11.111.11:9000"

                        def link = "<a href='%s/%s/%s'>%s</a><br/>";

                        currentBuild.setDescription(String.format(link, URL, SCIPT, DATE, "Test result"));

                }

        }

        stage('publishReport') {

                archiveArtifacts allowEmptyArchive: true, artifacts: "${RESULTS_DIR}/**/*", onlyIfSuccessful: false

                publishHTML([

                allowMissing: true,

                alwaysLinkToLastBuild: true,

                keepAll: true,

                reportDir: "${RESULTS_DIR}",

                reportFiles: "index.html",

                        reportName: "HTML Report",

                        reportTitles: ""])

        }

        stage('verifyBuild') {

            if (!buildSucceeded){

                error("Build failed...")

            } else{

                echo 'Succeeded!'

            }

      }

}