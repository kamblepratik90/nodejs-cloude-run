const { serviceAccount } = require("../serviceAccount");
var fs = require('fs');
var path = require("path");

// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');
// Imports the Google Cloud client library
const { Logging } = require('@google-cloud/logging');

const winston = require('winston');
// Imports the Google Cloud client library for Winston
const { LoggingWinston } = require('@google-cloud/logging-winston');

/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
const gcsUri = 'gs://nodejs-343313.appspot.com/cake_sonic.png';
const gcsUri_1 = 'gs://nodejs-343313.appspot.com/00.jpeg'
const gcsUri_gif_1 = 'gs://nodejs-343313.appspot.com/gif_1.gif'
const gcsUri_gif_2 = 'gs://nodejs-343313.appspot.com/gif_2.gif'
//'GCS URI of video to analyze, e.g. gs://my-bucket/my-video.mp4';

// Creates a client
const client = new vision.ImageAnnotatorClient({
    credentials: { private_key: serviceAccount.private_key, client_email: serviceAccount.client_email },
    projectId: serviceAccount.project_id,
});

/* logging */
// Creates a client
const logging = new Logging({
    credentials: { private_key: serviceAccount.private_key, client_email: serviceAccount.client_email },
    projectId: serviceAccount.project_id,
});
// Creates a logging client
const logName = 'imageAI-logging-log';
// Selects the log to write to
const log = logging.log(logName);
// The metadata associated with the entry
const metadataInfo = {
    resource: { type: 'global' },
    // See: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
    severity: 'INFO',
};

/* Logging Winston */
// const loggingWinston = new LoggingWinston();
// Creates a client
// const loggingWinston = new LoggingWinston({
//     projectId: serviceAccount.project_id,
//     keyFilename: '../keys.json',
//     defaultCallback: err => {
//         if (err) {
//             console.log('Error occured: ' + err);
//         }
//     },
//     labels: {
//         name: 'imageAI-logging-log',
//         version: '0.1.0'
//     }
// });

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
// const loggerWins = winston.createLogger({
//     level: 'info',
//     transports: [
//         new winston.transports.Console(),
//         // Add Stackdriver Logging
//         loggingWinston,
//     ],
// });



async function getLabelLocalFile(filePath) {

    // Read the file into memory.
    var imageFile = fs.readFileSync(filePath);

    const start = Date.now();
    const request = {
        image: {
            source: {
                imageUri: gcsUri
            }
        },
        features: [{
            type: "LABEL_DETECTION"
        }],
    };

    // Performs label detection on the image file
    const [result] = await client.labelDetection(imageFile);
    const labels = result.labelAnnotations;
    var list = [];
    labels.forEach((label) => list.push(label.description));
    console.log(' \n Labels:');
    console.log(JSON.stringify(list));

    // await can be skipped
    // await log.write(log.entry(metadataInfo, 'Labels/tags:'));
    // await log.write(log.entry(metadataInfo, JSON.stringify(list)));

    // Writes some log entries - loggerWins
    // await loggerWins.error('Labels/tags:');
    // await loggerWins.info(list);
    // await loggerWins.info(JSON.stringify(list));


    console.log(`\n getLabel took seconds = ${Math.floor((Date.now() - start) / 1000)} \n `);

}

async function getLabel(gcsUri) {

    const start = Date.now();
    const request = {
        image: {
            source: {
                imageUri: gcsUri
            }
        },
        features: [{
            type: "LABEL_DETECTION"
        }],
    };

    const [result] = await client.annotateImage(request);
    const labels = result.labelAnnotations;
    var list = [];
    labels.forEach((label) => list.push(label.description));
    console.log(' \n Labels:');
    console.log(JSON.stringify(list));

    // await can be skipped
    // await log.write(log.entry(metadataInfo, 'Labels/tags:'));
    // await log.write(log.entry(metadataInfo, JSON.stringify(list)));

    // Writes some log entries - loggerWins
    // await loggerWins.error('Labels/tags:');
    // await loggerWins.info(list);
    // await loggerWins.info(JSON.stringify(list));


    console.log(`\n getLabel took seconds = ${Math.floor((Date.now() - start) / 1000)} \n `);

}


async function detectFaces(gcsUri) {
    const start = Date.now();
    const request = {
        image: {
            source: {
                imageUri: gcsUri,
            }
        },
        features: [{
            type: "FACE_DETECTION"
        }],
    };

    // const [result] = await client.faceDetection('../media/00.jpeg');
    const [result] = await client.annotateImage(request);
    const faces = result.faceAnnotations;
    console.log(' \n Faces:');
    faces.forEach((face, i) => {
        console.log(`  Face #${i + 1}:`);
        console.log(`    Joy: ${face.joyLikelihood}`);
        console.log(`    Anger: ${face.angerLikelihood}`);
        console.log(`    Sorrow: ${face.sorrowLikelihood}`);
        console.log(`    Surprise: ${face.surpriseLikelihood} `);
    });
    console.log(`\n detectFaces took seconds = ${Math.floor((Date.now() - start) / 1000)} \n `);
}

async function detectSafeSearch(gcsUri) {
    const start = Date.now();
    const request = {
        image: {
            source: {
                imageUri: gcsUri,
            }
        },
        features: [{
            type: "SAFE_SEARCH_DETECTION"
        }],
    };

    // const [result] = await client.safeSearchDetection('gs://nodejs-343313.appspot.com/00.jpeg');
    const [result] = await client.annotateImage(request);
    const detections = result.safeSearchAnnotation;
    console.log(' \n safeSearchAnnotation: ');
    console.log(`Adult: ${detections.adult}`);
    console.log(`Spoof: ${detections.spoof}`);
    console.log(`Medical: ${detections.medical}`);
    console.log(`Violence: ${detections.violence} `);
    console.log(`\n detectSafeSearch took seconds = ${Math.floor((Date.now() - start) / 1000)} \n `);
}

async function detectWebContent(gcsUri) {
    const start = Date.now();
    const request = {
        image: {
            source: {
                imageUri: gcsUri,
            }
        },
        features: [{
            maxResults: 10,
            type: "WEB_DETECTION"
        }],
    };

    // const [result] = await client.webDetection('gs://nodejs-343313.appspot.com/00.jpeg');
    const [result] = await client.annotateImage(request);
    const webDetection = result.webDetection;
    if (webDetection.fullMatchingImages.length) {
        console.log(
            `Full matches found: ${webDetection.fullMatchingImages.length}`
        );
        webDetection.fullMatchingImages.forEach(image => {
            console.log(`  URL: ${image.url}`);
            console.log(`  Score: ${image.score}`);
        });
    }

    if (webDetection.partialMatchingImages.length) {
        console.log(
            `Partial matches found: ${webDetection.partialMatchingImages.length}`
        );
        webDetection.partialMatchingImages.forEach(image => {
            console.log(`  URL: ${image.url}`);
            console.log(`  Score: ${image.score}`);
        });
    }

    if (webDetection.webEntities.length) {
        console.log(`Web entities found: ${webDetection.webEntities.length}`);
        webDetection.webEntities.forEach(webEntity => {
            console.log(`  Description: ${webEntity.description}`);
            console.log(`  Score: ${webEntity.score}`);
        });
    }

    if (webDetection.bestGuessLabels.length) {
        console.log(
            `Best guess labels found: ${webDetection.bestGuessLabels.length}`
        );
        webDetection.bestGuessLabels.forEach(label => {
            console.log(`  Label: ${label.label}`);
        });
    }

    console.log(`\n webDetection took seconds = ${Math.floor((Date.now() - start) / 1000)} \n `);
}

async function detectWebContentGeographicMetadata(gcsUri) {
    const start = Date.now();
    const request = {
        image: {
            source: {
                imageUri: gcsUri,
            },
        },
        imageContext: {
            webDetectionParams: {
                includeGeoResults: true,
            },
        },
    };
    const request_1 = {
        "features": [
            {
                "type": "WEB_DETECTION"
            }
        ],
        "image": {
            "source": {
                "gcsImageUri": gcsUri
            }
        },
        "imageContext": {
            "webDetectionParams": {
                "includeGeoResults": true
            }
        }
    };

    // Detect similar images on the web to a remote file
    // const [result] = await client.webDetection(request);
    const [result] = await client.annotateImage(request_1);
    const webDetection = result.webDetection;
    webDetection.webEntities.forEach(entity => {
        console.log(`Score: ${entity.score}`);
        console.log(`Description: ${entity.description}`);
    });
    console.log(`\n detectWebContentGeographicMetadata took seconds = ${Math.floor((Date.now() - start) / 1000)} \n `);
}


async function main() {
    await getLabelLocalFile("./media/gif_1.gif")
    // await getLabel(gcsUri_gif_2);
    // await detectFaces(gcsUri_gif_2);
    // await detectSafeSearch(gcsUri_gif_2);
    // await detectWebContent(gcsUri_gif_2);
    // await detectWebContentGeographicMetadata(gcsUri_1)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });  