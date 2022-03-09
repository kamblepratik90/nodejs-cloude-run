const { serviceAccount } = require("../serviceAccount");

// Imports the Google Cloud Video Intelligence library
const videoIntelligence = require('@google-cloud/video-intelligence').v1;

// Creates a client
const client = new videoIntelligence.VideoIntelligenceServiceClient({
    credentials: { private_key: serviceAccount.private_key, client_email: serviceAccount.client_email },
    projectId: serviceAccount.project_id,
});

/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
// const gcsUri = 'gs://nodejs-343313.appspot.com/1.mp4';
// const gcsUri_1 = 'gs://nodejs-343313.appspot.com/e.mp4'
// const gcsUri_2 = 'gs://nodejs-343313.appspot.com/0_example_MP4_10MG.mp4';


const gcsUri_1 = 'gs://nodejs-343313.appspot.com/00.jpeg'
const gcsUri_gif_1 = 'gs://nodejs-343313.appspot.com/gif_1.gif'
const gcsUri_gif_2 = 'gs://nodejs-343313.appspot.com/gif_2.gif'
//'GCS URI of video to analyze, e.g. gs://my-bucket/my-video.mp4';


async function analyzeSafeSearch(gcsUri) {
    // [START video_analyze_explicit_content]
    const start = Date.now();
    const request = {
        inputUri: gcsUri,
        features: ['EXPLICIT_CONTENT_DETECTION'],
    };

    // Detects unsafe content
    return client.annotateVideo(request)
        .then(res => {
            console.log('Waiting for operation to complete... analyzeSafeSearch');
            return res[0].promise();
        })
        .then(res => {
            // console.log("res: ", res)
            const explicitContentResults =
                res[0].annotationResults[0].explicitAnnotation;
            // console.log('Explicit annotation results:', explicitContentResults);
            return new Promise((resolve, reject) => {
                explicitContentResults.frames.forEach(result => {
                    if (result.timeOffset === undefined) {
                        result.timeOffset = {};
                    }
                    if (result.timeOffset.seconds === undefined) {
                        result.timeOffset.seconds = 0;
                    }
                    if (result.timeOffset.nanos === undefined) {
                        result.timeOffset.nanos = 0;
                    }
                    if (result.pornographyLikelihood >= 3) {
                        console.log(`analyzeSafeSearch took seconds = ${Math.floor((Date.now() - start) / 1000)} and isExplicitContent => true`);
                        resolve(true);
                    }
                });
                console.log(`analyzeSafeSearch took seconds = ${Math.floor((Date.now() - start) / 1000)} and isExplicitContent => false`);
                resolve(false);
            });
        });
    //// [END video_analyze_explicit_content]
}

async function detectLabel(gcsUri) {
    const start = Date.now();
    const request = {
        inputUri: gcsUri,
        features: ['LABEL_DETECTION'],
    };

    // Detects labels in a video
    const [operation] = await client.annotateVideo(request);
    console.log('Waiting for operation to complete...');
    const [operationResult] = await operation.promise();

    // Gets annotations for video
    const annotations = operationResult.annotationResults[0];

    const labels = annotations.segmentLabelAnnotations;
    labels.forEach(label => {
        console.log(`Label ${label.entity.description} occurs at:`);
        label.segments.forEach(segment => {
            const time = segment.segment;
            if (time.startTimeOffset.seconds === undefined) {
                time.startTimeOffset.seconds = 0;
            }
            if (time.startTimeOffset.nanos === undefined) {
                time.startTimeOffset.nanos = 0;
            }
            if (time.endTimeOffset.seconds === undefined) {
                time.endTimeOffset.seconds = 0;
            }
            if (time.endTimeOffset.nanos === undefined) {
                time.endTimeOffset.nanos = 0;
            }
            console.log(
                `\tStart: ${time.startTimeOffset.seconds}` +
                `.${(time.startTimeOffset.nanos / 1e6).toFixed(0)}s`
            );
            console.log(
                `\tEnd: ${time.endTimeOffset.seconds}.` +
                `${(time.endTimeOffset.nanos / 1e6).toFixed(0)}s`
            );
            console.log(`\tConfidence: ${segment.confidence}`);
        });
        console.log(`detectLabel took seconds = ${Math.floor((Date.now() - start) / 1000)}`);
    });
}


async function main() {
    await analyzeSafeSearch(gcsUri_gif_1);
    await detectLabel(gcsUri_gif_1)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });  