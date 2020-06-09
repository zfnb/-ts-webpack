/**
 *小方块
 */
import {IPoint, IViewer} from "./interfaces";

export default class Square {
    private _point: IPoint = {x: 0, y: 0};
    private _color: string = "#fff";
    private _viewer?: IViewer;
    public get viewer() {
        return this._viewer;
    }

    public set viewer(v) {
        this._viewer = v;
        this._viewer?.show();
    }

    public get point() {
        return this._point;
    }
   //更新point,同时会更新元素视图的显示
    public set point(v) {
        this._point = v;
        if (this._viewer) {
            //显示元素视图
            this._viewer.show();
        }
    }

    public get color() {
        return this._color;
    }

    public set color(v) {
        this._color = v;
    }
}