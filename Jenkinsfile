node {

        properties(

            [

                disableConcurrentBuilds(),

                buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '25', numToKeepStr: '25')),

                parameters([

                        choice(name: 'ITERATIONS', choices: '1\n2\n3', description: 'Number of iterations' ),

                ])          

            ])

        stage('pullLatestCode'){

                git branch: 'main',

                url: 'https://github.com/Anastasiia-Iakovleva/LighthouseTest.git'

        }

        stage('preparation') {

                buildSucceeded = true       
                bat "mkdir $WORKSPACE\\$BUILD_NUMBER\\testResults\\"				

        }

        stage('runShell') {

                print "---------- Running tests ----------"

                 try {

                    bat "node puppeteer.js"

                } catch (err) {

                    echo "Failed: ${err}"

                    buildSucceeded = false

                }

        }

        stage('verifyBuild') {

            if (!buildSucceeded){

                error("Build failed...")

            } else{

                echo 'Succeeded!'

            }

      }

}