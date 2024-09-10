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

import { useRef, useEffect } from "react";

import { setAssetPath } from "@esri/calcite-components/dist/components";
setAssetPath(window.location.href);

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
import "./App.css";



function App() {

    // useRef, useEffect を使った書き方は
    // https://github.com/AndresKasekamp/calcite-arcgis-hmr/tree/master を参照
    const mapDiv = useRef(null);

    useEffect(() => {
        if (mapDiv.current) {
            // 
            // https://github.com/kataya/vite-jsapp/blob/main/main.js と同様の処理
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
                document.addEventListener("calciteActionBarToggle", () => {
                    actionBarExpanded = !actionBarExpanded;
                    view.padding = {
                        left: actionBarExpanded ? 135 : 45
                    };
                });

            });
        }
    },[mapDiv]);

    // 元の <></> の内部の定義を calcite-components-react の定義に変更
    // CalcitePanel の heading がnpm run dev だと表示されない。。。
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
    );

    //return <div className="mapDiv" ref={mapDiv}></div>

}

export default App
