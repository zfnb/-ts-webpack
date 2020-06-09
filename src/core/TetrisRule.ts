import {Direction, IPoint, Shape} from "./interfaces";
import GameConfig from "./GameConfig";
import SquareGroup from "./SquareGroup";
import Square from "./Square";

//方块组规则类
export class TetrisRule {
    //判断是否还能移动，传入shape方块形状数组，和方块组中心位置坐标对象
    static canIMove(shape: Shape, centerPoint: IPoint, exist: Square[]): boolean {
        //边界判断
        //根据中心点位置，修改所有小方块组元素的位置
        const targetSquarePoints: IPoint[] = shape.map(point => {
            //将更新完位置的方块组坐标返回
            return {
                x: centerPoint.x + point.x,
                y: centerPoint.y + point.y
            }
        });
        // 判断方块组中每一个元素是否超过边界，如果有一个元素越界则返回true
        const result = targetSquarePoints.some(shapeItem => {
            return shapeItem.x < 0 ||
                shapeItem.x > GameConfig.panelSize.width - 1 ||
                shapeItem.y < 0 ||
                shapeItem.y > GameConfig.panelSize.height - 1
        })
        //判断与已有方块是否有重叠
        const idOverlap = targetSquarePoints.some(point => {
            return exist.some(shape => shape.point.x === point.x && point.y === shape.point.y);
        })
        //如果result为true,说明有越界的元素，返回false，不允许再运动
        if (result || idOverlap) {
            return false;
        }
        //到达这个地方说明可以运动
        return true;
    }

    //方法重载 传递方块组和移动目标点位置，移动到目标点
    static move(tetris: SquareGroup, targetPoint: IPoint, exist: Square[]): boolean;
    //方法重载 传递方块组和移动方向，每次调用向目标方向移动一个单元格
    static move(tetris: SquareGroup, direction: Direction, exist: Square[]): boolean;
    static move(tetris: SquareGroup, targetPointOrDirection: IPoint | Direction, exist: Square[]): boolean {
        //经过类型保护函数推断出targetPointOrDirection是一个IPoint类型
        if (isPoint(targetPointOrDirection)) {
            //判断是否还可以移动
            if (this.canIMove(tetris.shape, targetPointOrDirection, exist)) {
                //如果可以移动，将方块组的centerPoint（中心点）的中心的设置为目标值
                tetris.centerPoint = targetPointOrDirection;
                return true;
            }
            return false;
        } else {
            //储存目标方向
            const direction = targetPointOrDirection;
            //将要移动的目标值
            let targetPoint: IPoint;
            //如果方向为向下，将目标值设置为新的值（向下移动一个位置）
            if (direction === Direction.down) {
                targetPoint = {
                    x: tetris.centerPoint.x,
                    y: tetris.centerPoint.y + 1
                }
            }
            //如果方向为向左，将目标值设置为新的值（向左移动一个位置）
            else if (direction === Direction.left) {
                targetPoint = {
                    x: tetris.centerPoint.x - 1,
                    y: tetris.centerPoint.y
                }
            }
            //如果方向为向右，将目标值设置为新的值（向右移动一个位置）
            else {
                targetPoint = {
                    x: tetris.centerPoint.x + 1,
                    y: tetris.centerPoint.y
                }
            }
            //调用自身，将方块组和目标坐标传入
            return this.move(tetris, targetPoint, exist);
        }
    }

    //一直移动直到边界
    static moveDirection(tetris: SquareGroup, direction: Direction, exist: Square[]) {
        // while (true) {
        //     //如果能移动则一直移动，到了move返回false的时候break退出循环
        //     if (!this.move(tetris, direction, exist)) {
        //         break;
        //     }
        // }
        this.move(tetris, direction, exist);
        this.move(tetris, direction, exist);
        // this.move(tetris, direction, exist);
    }

    //旋转函数，传入一个方块组
    static rotate(tetris: SquareGroup, exist: Square[]): boolean {
        //调用旋转函数返回一个新的旋转后的shape坐标对象
        const newShape = tetris.afterRotateShape();
        //判断方块组是否可以移动
        if (this.canIMove(newShape, tetris.centerPoint, exist)) {
            //如果可以旋转，将方块组旋转
            tetris.rotate();
            return true;
        }
        return false;
    }

    static deleteSquares(exist: Square[]): number {
        //获取每个方块的y坐标数组
        const squareY = exist.map(sq => sq.point.y);
        //获取最大y坐标
        const maxY = Math.max(...squareY);
        //获取最小y坐标
        const minY = Math.min(...squareY);
        let num: number = 0;
        for (let y = minY; y <= maxY; y++) {
            //删除根据存在方块数组exist，和某一行y判断是否删除这一行
            if (this.deleteLine(exist, y)) {
                num++;
            }
        }
        //返回删除几行
        return num;
    }

    static deleteLine(exist: Square[], y: number): boolean {
        //获取这一行的方块元素数组
        const squares = exist.filter(squareY => squareY.point.y === y);
        //如果这一行方块元素的个数长度等于容器面板长度，说明这一行满了，可以消除
        if (squares.length === GameConfig.panelSize.width) {
            //从界面删除这一行数组
            squares.forEach(square => {
                //调用remove方法从界面消除每一个方块元素
                if (square.viewer) {
                    square.viewer.remove();
                }
                //从exist数组中移除这一行的元素
                const index = exist.indexOf(square);
                exist.splice(index, 1);
            })
            //剩下的方块，如果比当前被消除方块的y小，则说明这些方块在目标行的上面，
            // 则这些方块的坐标下移一格，也就是y+1
            exist.filter(sq => sq.point.y < y).forEach(sq => {
                sq.point = {
                    x: sq.point.x,
                    y: sq.point.y + 1
                }
            })
            return true;
        }
        return false;
    }
}

//类型保护函数
function isPoint(obj: any): obj is IPoint {
    //如果obj.x没有值返回false
    if (typeof obj.x === "undefined") {
        return false;
    }
    //如果obj.y有值，obj的值类型判断为IPoint
    return true;
}