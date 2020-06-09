import {Direction, GameStatus, GameViewer} from "./interfaces";
import {createTetris} from './Tetris';
import SquareGroup from "./SquareGroup";
import {TetrisRule} from "./TetrisRule";
import GameConfig from "./GameConfig";
import Square from "./Square";
//游戏类
export default class Game {
    //当前游戏的状态
    private _gameStatus: GameStatus = GameStatus.init;
    //当前方块组
    private _curTetris?: SquareGroup;
    //下一个方块组
    private _nextTetris: SquareGroup = createTetris({x: 0, y: 0});
    //计时器
    private _timer: number | null = null;
    //时间
    private _duration: number = GameConfig.levels[0].duration;
    //已经存在的小方块数组
    private _exist: Square[] = [];
    //积分
    private _score: number = 0;

    public get score() {
        return this._score;
    }

    public set score(v) {
        this._score = v;
        this._viewer?.showScore(this.score);
        const level = GameConfig.levels.filter(item => item.score < this.score).pop()!;
        if (this._duration === level.duration) {
            return;
        }
        this._duration = level.duration;
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
            this.autoDrop();
        }
    }

    constructor(private _viewer: GameViewer) {
        this._viewer.showNext(this._nextTetris);
        this.resetCenterPoint(GameConfig.nextSize.width, this._nextTetris);
        this._viewer.init(this);
    }

    public get gameStatus() {
        return this._gameStatus;
    }

    //初始化函数
    private init() {
        this._exist.forEach(sqare => {
            sqare.viewer?.remove();
        })
        this._exist = [];
        this._score = 0;
        this._nextTetris = createTetris({x: 0, y: 0});
        this.resetCenterPoint(GameConfig.nextSize.width, this._nextTetris);
        this._viewer.showNext(this._nextTetris);
        this._curTetris = undefined;
    }

    //开始游戏
    public start() {
        //如果当前游戏状态是playing，直接返回
        if (this._gameStatus === GameStatus.playing) {
            return;
        }
        if (this._gameStatus === GameStatus.over) {
            //进行初始化
            this.init();
        }
        //如果当前游戏状态不是playing，将游戏状态设置为playing
        this._gameStatus = GameStatus.playing;
        //如果当前方块组为空
        if (!this._curTetris) {
            //调用切换函数，为curTetris赋值
            this.switchTetris();
        }
        this.autoDrop();
        this._viewer.onGameStart();
    }

    //暂停游戏
    public pause() {
        if (this._gameStatus === GameStatus.playing && this._timer && this._curTetris) {
            clearInterval(this._timer);
            this._timer = null;
            this._gameStatus = GameStatus.pause;
            this._viewer.onGamePause();
        }
    }

    //控制旋转函数
    public controlRotate() {
        if (this._curTetris && this._gameStatus === GameStatus.playing) {
            TetrisRule.rotate(this._curTetris, this._exist);
        }
    }

    //控制下落函数
    public controlToDown() {
        if (this._curTetris && this._gameStatus === GameStatus.playing) {
            TetrisRule.moveDirection(this._curTetris, Direction.down, this._exist);
            //触底操作
            // this.hitBottom();
        }
    }

    //控制向左运动函数
    public controlToLeft() {
        if (this._curTetris && this._gameStatus === GameStatus.playing) {
            TetrisRule.move(this._curTetris, Direction.left, this._exist);
        }
    }

    //控制向右运动函数
    public controlToRight() {
        if (this._curTetris && this._gameStatus === GameStatus.playing) {
            TetrisRule.move(this._curTetris, Direction.right, this._exist);
        }
    }

    //自由下落函数
    public autoDrop() {
        //如果当前游戏转态不是playing状态,或者存在计时器直接返回，什么也不做
        if (this._timer || this._gameStatus !== GameStatus.playing) {
            return;
        }
        //设置计时器，控制自由下落
        this._timer = setInterval(() => {
            //如果当前方块组有值
            if (this._curTetris) {
                //调用下落函数
                const isMove = TetrisRule.move(this._curTetris, Direction.down, this._exist);
                if (!isMove) {
                    //触底
                    this.hitBottom();
                }
            }
        }, this._duration);
    }

    //切换方块组状态函数
    private switchTetris() {
        //将当前方块组设置为下一个方块组
        this._curTetris = this._nextTetris;
        //并移除页面的下一个方块组的视图展示
        this._nextTetris.squares.forEach(sqare => {
            if (sqare.viewer) {
                sqare.viewer.remove();
            }
        })
        //重新计算this._curTetris方块组位置，this._nextTetris
        this.resetCenterPoint(GameConfig.panelSize.width, this._curTetris);
        if (!TetrisRule.canIMove(this._curTetris.shape, this._curTetris.centerPoint, this._exist)) {
            //游戏结束
            this._gameStatus = GameStatus.over;
            if (this._timer) {
                clearInterval(this._timer);
                this._timer = null;
            }
            this._viewer.onGameOver();
            return;
        }
        //为下一个方块组设置为一个新的随机方块组
        this._nextTetris = createTetris({x: 0, y: 0});
        //重新设置this._nextTetris的坐标位置,在当前容器的中心位置
        this.resetCenterPoint(GameConfig.nextSize.width, this._nextTetris);
        //调用切换视图函数
        this._viewer.switch(this._curTetris);
        //调用设置下一个方块组视图函数
        this._viewer.showNext(this._nextTetris);
    }

    private resetCenterPoint(width: number, tetris: SquareGroup) {
        //根据宽度和传入方块组设置起始坐标
        const x = Math.ceil(width / 2) - 1;
        const y = 0;
        //将方块组的中心设置为x,y
        tetris.centerPoint = {x, y};
        //如果方块组元素有一个元素在的y坐标小于0
        while (tetris.squares.some(square => square.point.y < 0)) {
            //改变中心点坐标坐标对象，将方块组向下移动，直到y>=0
            tetris.centerPoint = {
                x: tetris.centerPoint.x,
                y: tetris.centerPoint.y + 1
            }
        }
    }

    //触底处理函数
    hitBottom() {
        //将当前的方块组的每一个方块放入exist数组中，记录方块元素是否已经存在于页面
        this._exist = this._exist.concat(this._curTetris!.squares);
        //消除方块,获取消除的行数
        const num = TetrisRule.deleteSquares(this._exist);
        this.addScore(num);
        //切换方块组
        this.switchTetris();
    }

    addScore(removeLine: number) {
        if (removeLine === 1) {
            this.score += 1;
        } else if (removeLine === 2) {
            this.score += 5;
        } else if (removeLine === 3) {
            this.score += 15;
        } else if (removeLine === 4) {
            this.score += 66;
        }
    }
}