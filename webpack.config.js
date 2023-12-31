const path = require("path");
const bundleOutputDir = "./public";

module.exports = {
    entry: {
        main: "./src/main",
        pdCollection: "./src/collectionChecker",
        pdRotation: "./src/pdRotation"
    },
    output: {
        filename: "[name].bundle.js",
        path: path.join(__dirname, bundleOutputDir),
        publicPath: 'public/dist/'
    },
    devtool: "source-map",
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: ['/node_modules/']
            },            
            { test: /\.tsx?$/, loader: "ts-loader" },        
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.xml$/i,
                type: 'asset/source',
            },
            {
                test: /\.json$/i,
                type: 'asset/source',
            },
            {
                test: /\.txt$/i,
                type: 'asset/source',
            }
        ]
    }
};

