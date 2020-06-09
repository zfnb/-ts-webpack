import {IViewer} from "../interfaces";
import PageConfig from "./PageConfig";
import Square from "../Square";
import $ from 'jquery'

export default class SquarePageViewer implements IViewer {
    private dom?: JQuery<HTMLElement>;
    private isRemove: boolean = false;
    private square: Square;
    private container: JQuery<HTMLElement>

    constructor(square: Square, container: JQuery<HTMLElement>) {
        this.square = square;
        this.container = container;
    }

    show() {
        if (this.isRemove) {
            return;
        }
        if (!this.dom) {
            this.dom = $("<div>").css({
                position: "absolute",
                width: PageConfig.SquareSize.width,
                height: PageConfig.SquareSize.height,
                border: "1px solid #ccc",
                boxSizing: "border-box"
            }).appendTo(this.container);
        }
        this.dom.css({
            left: this.square.point.x * PageConfig.SquareSize.width,
            top: this.square.point.y * PageConfig.SquareSize.height,
            backgroundColor: this.square.color
        })
    }

    remove(): void {
        if (this.dom && !this.isRemove) {
            this.dom.remove();
            this.isRemove = true;
        }
    }
}