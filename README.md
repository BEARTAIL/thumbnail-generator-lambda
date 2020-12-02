# Thumbnail Generator Lambda
PDFのプレビュー生成、および画像のサムネイル生成処理を行うLambda Function

## Requirements
ローカルで実行する場合は、Ghostscript, ImageMagickをインストールしておくこと.\
Lambda上では、 ghostscript-aws-lambda-layer, image-magick-aws-lambda-layerを使用するため、それぞれ予めリリースしておく必要がある.

## Specification
S3の特定のprefixに関して、S3 Objectが作成・更新された時に、SNSのトピックにイベントが通知される.\
このイベントをトリガーとして、以下のFunctionが実行される.

### PDFのプレビュー生成
PDFのプレビューをGhostscriptを使って生成する.

1. アップロードされたファイルをダウンロード
  - 画像ファイルの場合は処理を終了
2. 1のファイルを `gs` コマンドを使ってJPEGに変換する
3. 2で作成されたファイルをアップロードする
  - 同じprefixでアップロードされることにより、次の画像のサムネイル生成処理が実行される

### 画像のサムネイル生成
画像のサムネイルをImageMagickを使って生成する.

1. アップロードされたファイルをダウンロード
  - PDFファイルの場合は処理を終了
2. 1のファイルから、EXIF等のメタデータを除去した画像ファイルでを作成する
  - JPEG, PNGの場合はJPEG、GIFの場合はGIFを、縮尺を維持したまま作成する
  - 長辺は最大で3840px以下にする
3. 2で作成されたファイルをアップロードする
4. 2で作成されたファイルを元に、サムネイル画像を作成する（画像のサイズは、長辺が128のもの、短辺が512のものの2種類）
  - JPEG, PNG: 5MBに収まるように変換
  - GIF: 背景色を白にして、容量を最適化したGIFを生成
5. 4で生成されたファイルを順次アップロードする

## Usage
### Command

```sh
# ローカル実行
yarn start

# リモート実行
env S3_BUCKET=test S3_OBJECT_KEY=key.jpg yarn start:remote -f generate-thumbnails

# テスト
yarn run test

# E2Eテスト（ただし、特定のkeyでファイルがアップロードされている必要がある. 詳細は `test/data/index.json` を参照）
S3_BUCKET=your-bucket S3_OBJECT_PREFIX=prefix yarn test:e2e:staging
```

## Release
```sh
# サービス全体のリリース
yarn release

# Lambda Functionのコード修正のみのリリース
yarn release -f generate-pdf-preview
```

### Configuration
1. ダウンロード元（＝アップロード先）となるS3バケット

    SNSのトピックの設定の他に、Lambda Functionの権限設定のためにオプションで指定する必要がある.

    ```sh
    # Serverlessコマンドのオプションで指定する
    yarn release --bucket test

    # 複数のバケットを使う場合
    yarn release --bucket test1 --bucket test2
    ```

1. サムネイルのアップロード先

    生成されたサムネイルは、元のファイルと同じバケットにアップロードされるが、prefixを変更することは可能.

    ```sh
    # 環境変数で指定する
    env THUMBNAIL_DESTINATION_PREFIX=dest yarn release
    ```

3. サービス名称
    serverless.ymlのserviceで指定する名称を変更できる.

    ```sh
    # Serverlessコマンドのオプションで指定する
    yarn release --service your-service-name
    ```

## LICENSE
AGPL 3.0

なお、内部でGhostscript, ImageMagick, Popplerを使用している.
