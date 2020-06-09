/**
 * 小方块数组类
 * 该数组组成不能发生变化，是只读数组
 * 一个组合有四个小方块
 * 一个方块的组合，取决于组合的情况（一组小方块的组合，有一个特殊坐标，表示形状的中心）
 * [
 * */
import Square from "./Square";
import {IPoint, Shape} from "./interfaces";

export default class SquareGroup {
    //方块组，储存四个方块
    private _squares: readonly Square[];
    //判断是否是顺时针旋转
    protected isClock: boolean = true;

    //获取方块组
    public get squares() {
        return this._squares;
    }

    //获取shape坐标组
    public get shape() {
        return this._shape;
    }

    constructor(
        //方块组
        private _shape: Shape,
        //中心点坐标
        private _centerPoint: IPoint,
        //方块组颜色
        private _color: string) {
        //设置小方块集合数组
        const array: Square[] = [];
        //创建每一个方块组的元素，将元素装填到方块组中
        this._shape.forEach(p => {
            //构造每一个方块元素实例
            const square = new Square();
            //设置颜色
            square.color = this._color;
            array.push(square);
        })
        //将创建的数组赋值给方块组
        this._squares = array;
        //更新方块组所有元素的位置
        this.setSquarePoints();
    }

    //获取方块组中心点
    get centerPoint() {
        return this._centerPoint;
    }

    //设置方块组中心点
    set centerPoint(v) {
        //设置方块组坐标
        this._centerPoint = v;
        //设置所有小方块坐标
        this.setSquarePoints();
    }

    //根据形状坐标更新每一个小方块的位置
    private setSquarePoints() {
        this._shape.forEach((point, i) => {
            //point是固定形状数组，每个元素代表组成方块组的每一个小方块位置坐标。
            this._squares[i].point = {
                //遍历方块组，更新每一个方块组的point，与中心坐标centerPoint同步改变
                x: this._centerPoint.x + point.x,
                y: this._centerPoint.y + point.y
            }
        })
    }


    //旋转函数，调用返回一个旋转完的新的shape坐标组
    afterRotateShape(): Shape {
        if (this.isClock) {
            //顺时针旋转后坐标变化规律x,y=>-y,x;
            return this._shape.map(point => {
                const newPoint: IPoint = {
                    x: -point.y,
                    y: point.x
                }
                return newPoint;
            })
        } else {
            //逆时针旋转后坐标变化规律x,y=>y,-x;
            return this._shape.map(point => {
                const newPoint: IPoint = {
                    x: point.y,
                    y: -point.x
                }
                return newPoint;
            })
        }
    }

    rotate() {
        //调用旋转函数，将旋转完的新shape坐标组赋值给shape坐标数组
        this._shape = this.afterRotateShape();
        //更新所有小方块元素位置
        this.setSquarePoints();
    }
}