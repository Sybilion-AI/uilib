declare function _default(env: any, argv: any): {
    entry: string[];
    output: {
        path: string;
    };
    resolve: {
        modules: string[];
        extensions: string[];
        alias: {
            '#uilib': string;
            uilib: string;
            'docs/components': string;
        };
    };
    optimization: {
        moduleIds: string;
        minimize: boolean;
    };
    module: {
        rules: ({
            test: RegExp;
            loader: string;
            include: string[];
            options: {
                plugins: string[];
            };
            use?: undefined;
            type?: undefined;
        } | {
            test: RegExp;
            use: (string | {
                loader: string;
                options?: undefined;
            } | {
                loader: string;
                options: {
                    modules: {
                        localIdentName: string;
                    };
                    postcssOptions?: undefined;
                };
            } | {
                loader: string;
                options: {
                    postcssOptions: {
                        ident: string;
                        plugins: (string | {
                            stage: number;
                            autoprefixer: boolean;
                        })[][];
                    };
                    modules?: undefined;
                };
            })[];
            loader?: undefined;
            include?: undefined;
            options?: undefined;
            type?: undefined;
        } | {
            test: RegExp;
            use: {
                loader: string;
                options: {
                    icon: boolean;
                    ext: string;
                    typescript: boolean;
                    exportType: string;
                };
            }[];
            loader?: undefined;
            include?: undefined;
            options?: undefined;
            type?: undefined;
        } | {
            test: RegExp;
            use: {
                loader: string;
                options: {
                    name: string;
                    outputPath: string;
                };
            };
            loader?: undefined;
            include?: undefined;
            options?: undefined;
            type?: undefined;
        } | {
            test: RegExp;
            type: string;
            loader?: undefined;
            include?: undefined;
            options?: undefined;
            use?: undefined;
        })[];
    };
    plugins: (ReactRefreshPlugin | CopyWebpackPlugin | HtmlWebpackPlugin | MiniCssExtractPlugin | CleanWebpackPlugin | webpack.ProvidePlugin | webpack.DefinePlugin | FaviconWebpackPlugin)[];
};
export default _default;
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import webpack from 'webpack';
import FaviconWebpackPlugin = require("favicons-webpack-plugin");
