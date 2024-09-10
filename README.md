# vite-react-jsapp

フロントエンドのビルドツール、Vite（ヴィート）を使ってArcGIS Maps SDK for JavaScript 、Calcite Components、Calcite Components React で最初のアプリを試してみたソースコードです。  
※ Vite は Node.js 14.18+、16+ のバージョンが必要です。  

## 自分で Vite でJavaScript のReact アプリケーション を作成する場合の手順

### Vite アプリ テンプレートでひな形を作成
Vite のアプリ テンプレート で、次のコマンドでアプリケーション
のひな形を作成します。
```
npm create vite@latest vite-react-jsapp
```

テンプレートから framework の選択時には react プロジェクト、variant は JavaScript を選択します。
```
√ Select a framework: React
√ Select a variant: JavaScript
```

それが完了したら、画面に表示されている手順に沿ってディレクトリを移動します。
```
cd vite-react-jsapp
```
次に、ArcGIS Maps SDK for JavaScript 、Calcite Components 、Calcite Components React の最新バージョンをインストールします。
```
npm install @arcgis/core @esri/calcite-components @esri/calcite-components-react
```

Calcite Components のリソースのコピー用に、ncp をインストールします。
```
npm install ncp
```


### Map アプリ用に編集

#### リソースのコピーコマンドの追加

`package.json` の "scripts" に、assets のリソースをコピーする、copy コマンドを追加しておきます。
```
"copy": "ncp ./node_modules/@esri/calcite-components/dist/calcite/assets/ ./public/assets/"
```
<br>

#### ソースファイルの構成
プロジェクトの src フォルダー下に、次のファイルがありますので、変更していきます。
```
src  
 |- App.css
 |- App.jsx
 |- index.css
 └─ main.jsx
```
#### App.css
`App.css` でアプリ テンプレートで書かれている内容を全て削除し、次のスタイルを記述します。
```
.mapDiv {
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
  }
```
<br>

#### index.css
`index.css` も同様に、アプリ テンプレートで書かれている内容を削除し、次のスタイルを記述します。
```
@import '@arcgis/core/assets/esri/themes/light/main.css';
html,
body,
#root {
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
}
```
<br>

#### main.jsx
`main.jsx` で、ローカル アセットを参照するように、次の記述を追加します。
```
import { setAssetPath } from "@esri/calcite-components/dist/components";
setAssetPath(window.location.href);
```

また、デバック時に二重で描画されてしまうのを回避するため、`<StrictMode></StrictMode>` を削除します。
```
createRoot(document.getElementById('root')).render(
    <App />
)
```
<br>

#### App.jsx
`App.jsx` は、全面的に書き換えします。今回のアプリケーションは、Vite を使ってCalcite + ArcGIS Maps SDK for JavaScript での地図アプリケーションを作成した、[vite js app](https://github.com/kataya/vite-jsapp/blob/main/main.js) のコードをもとに、書き換えすることにします。
まずは、React, ArcGIS Maps SDK for JavaScript, Calcite Components, Calcite Components React への参照を追加します。

```
import { useRef, useEffect } from "react";
// calcite-components
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-action-bar";
import "@esri/calcite-components/dist/components/calcite-action";
// calcite-components-react
import { 
    CalciteShell,
    CalcitePanel,
    CalciteShellPanel,
    CalciteActionBar,
    CalciteAction
} from "@esri/calcite-components-react";
import "@esri/calcite-components/dist/calcite/calcite.css";
// JS API
import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/views/MapView";
import Basemap from "@arcgis/core/Basemap";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery";
import LayerList from "@arcgis/core/widgets/LayerList";
import Legend from "@arcgis/core/widgets/Legend";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
// Style
import './App.css'
```

function App() 内を、[vite js app](https://github.com/kataya/vite-jsapp/blob/main/main.js) のコードをもとに、書き換えします。
```
function App() {

    const mapDiv = useRef(null);

    useEffect(() => {
        if (mapDiv.current) {
            // 
            // Initialize application
            const basemap = new Basemap({
                portalItem: {
                    id: "accf3eff22254ed69e23afeb094a4881" //"street-vector"の日本語版
                }
            });
            const map = new Map({
                //basemap: "streets-vector",
                basemap: basemap,
            });
            const view = new MapView({
                container: mapDiv.current,
                map: map,
                zoom: 8,
                center: [139.715512, 35.678257], // 皇居を中心にした周辺
                padding: { // calcite-action-bar 用にpadding を設定
                    left:49
                }
            });
            view.ui.move("zoom", "bottom-right"); // default の zoom をMapViewer と同じ右下レイアウトへ移動

            // widgetをそれぞれのcalcite-panel 内の container に追加
            new BasemapGallery({
                view: view,
                container: document.getElementById("basemaps-container")
            });

            new LayerList({
                view,
                //selectionEnabled: true, //
                dragEnabled: true,
                container: document.getElementById("layers-container")
            });

            new Legend({
                view,
                container: document.getElementById("legend-container")
            });

            // レンダラーを定義
            const cityRenderer = new SimpleRenderer({
                // new SimpleRenderer() でインスタンスを作成した時にはエラーになるのでコメントアウト
                // type: "simple", // autocasts as new SimpleRenderer() 
                symbol: {
                    type: "simple-fill", // autocasts as new SimpleFillSymbol()
                    style: "solid", //"none",
                    outline: { // autocasts as new SimpleLineSymbol()
                        style: "solid",
                        width: 1.5,
                        color: [0, 0, 0, 0.5]
                    }
                }
            });

            // FeatureLayerを追加（全国市区町村界データ 2021： Living Atlas）
            const cityAreaLyr = new FeatureLayer({
                url: "https://services.arcgis.com/wlVTGRSYTzAbjjiC/arcgis/rest/services/municipalityboundaries2021/FeatureServer",
                id: "cityarea",
                opacity: 0.5,
                minScale: 5000000,
                maxScale: 5000,
                visible: true,
                title: "全国市区町村界データ 2021",
                renderer: cityRenderer,
                outFields: ["*"],
                // 埼玉県のみになるようフィルタ定義を追加
                definitionExpression: "JCODE LIKE '11%'"
            });

            // 市区町村用のPopupTemplate の作成
            const cityPopupTemplate = new PopupTemplate({
                title: "全国市区町村界",
                content: [
                    {
                        type: "text",
                        text: "自治体コード: {JCODE}" + "</br>" + "都道府県名: {KEN}" + "</br>" +"市区町村名: {SEIREI}{SIKUCHOSON}"
                    }
                ]
            });
            cityAreaLyr.popupTemplate = cityPopupTemplate;

            // Mapにレイヤーを追加
            map.add(cityAreaLyr);

            view.when(() =>{

                let activeWidget;
                const handleActionBarClick = ({ target }) => {
                    if (target.tagName !== "CALCITE-ACTION") {
                        return;
                    }

                    if (activeWidget) {
                        document.querySelector(`[data-action-id=${activeWidget}]`).active = false;
                        document.querySelector(`[data-panel-id=${activeWidget}]`).hidden = true;
                    }
                    const nextWidget = target.dataset.actionId;
                    if (nextWidget !== activeWidget) {
                        document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
                        document.querySelector(`[data-panel-id=${nextWidget}]`).hidden = false;
                        activeWidget = nextWidget;
                    } else {
                        activeWidget = null;
                    }
                };

                document.querySelector("calcite-action-bar").addEventListener("click", handleActionBarClick);
                
                let actionBarExpanded = false;
                document.addEventListener("calciteActionBarToggle", event => {
                    actionBarExpanded = !actionBarExpanded;
                    view.padding = {
                        left: actionBarExpanded ? 135 : 45
                    };
                });

            });
        }
    },[mapDiv]);

    return (
        <>
        <CalciteShell content-behind id="calcite-shell">
            <h2 id="header-title" slot="header">Intro to React + ArcGIS JS with Vite</h2>
            <CalciteShellPanel slot="panel-start" displayMode="float">
                <CalciteActionBar slot="action-bar">
                    <CalciteAction data-action-id="layers" icon="layers" text="レイヤー" ></CalciteAction >
                    <CalciteAction data-action-id="basemaps" icon="basemap" text="背景地図"></CalciteAction>
                    <CalciteAction data-action-id="legend" icon="legend" text="凡例"></CalciteAction>
            </CalciteActionBar>
            <CalcitePanel heading="レイヤー" height-scale="l" data-panel-id="layers" hidden>
                <div id="layers-container"></div>
            </CalcitePanel>
            <CalcitePanel heading="背景地図" height-scale="l" data-panel-id="basemaps" hidden>
                <div id="basemaps-container"></div>
            </CalcitePanel>
            <CalcitePanel heading="凡例" height-scale="l" data-panel-id="legend" hidden>
                <div id="legend-container"></div>
            </CalcitePanel>
            </CalciteShellPanel>
            <div className="mapDiv" ref={mapDiv}></div>
        </CalciteShell>
        </>
    )
}
```

### Map アプリを表示
ターミナルから、copy コマンドを実行して、リソースのコピーを実行します。
```
npm run copy
```
同様に、ターミナルから、dev コマンドを実行し、はじめての Vite ＋ React  ＋ Calcite Components ＋ ArcGIS Maps SDK for JavaScript のアプリケーションを表示します。
```
npm run dev
```

![intro-react-calcite-vite-jsapp](https://github.com/kataya/vite-react-jsapp/blob/master/images/intro-react-calcite-vite-jsapp.png?raw=true)

## 参考

* ArcGIS Maps SDK for JavaScript with React using Vite
https://github.com/AndresKasekamp/calcite-arcgis-hmr/tree/master

* ArcGIS ESM with create-react-app
https://odoe.net/blog/create-react-app

* arcgis-calcite-react
https://github.com/odoe/arcgis-calcite-react

* Integrating The ArcGIS JavaScript API With React
https://www.esri-ireland.ie/en-ie/resource-centre/we-talk-tech/integrating-the-arcgis-javascript-api-with-react

* Integrating ESRI Maps into your React App 
https://dev.to/imkarthikeyan/integrating-esri-maps-into-your-react-app-2e1h


