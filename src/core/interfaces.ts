import SquareGroup from "./SquareGroup";
import Game from "./Game";

export interface IPoint {
    readonly x: number,
    readonly y: number
}

export interface IViewer {
    //显示小方块
    show: () => void;
    //移除小方块
    remove: () => void;
}

export type Shape = IPoint[];

export enum Direction {
    down,
    left,
    right,
}

//游戏状态
export enum GameStatus {
    init,//游戏未开始
    playing,//进行中
    pause,//暂停
    over//游戏结束
}

export interface GameViewer {
    //下一个方块对象
    showNext(teters: SquareGroup): void;

    //切换方块的对象
    switch(teters: SquareGroup): void;

    //初始化页面
    init(game: Game): void;

    //显示分数
    showScore(score:number): void;
    //游戏暂停控制器
    onGamePause():void;
    //游戏开始控制器
    onGameStart():void;
    //游戏结束控制器
    onGameOver():void;
}