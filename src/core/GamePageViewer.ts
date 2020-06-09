import {GameStatus, GameViewer} from "./interfaces";
import $ from 'jquery';
import SquareGroup from "./SquareGroup";
import SquarePageViewer from "./viewer/SquarePageViewer";
import Game from "./Game";
import GameConfig from "./GameConfig";
import PageConfig from "./viewer/PageConfig";

export default class GamePageViewer implements GameViewer {
    private nextDom = $("#next");
    private panelDom = $("#panel");
    private scoreDom = $("#score");
    private msgDom = $("#msg");

    //初始化游戏
    init(game: Game): void {
        this.panelDom.css({
            width: GameConfig.panelSize.width * PageConfig.SquareSize.width,
            height: GameConfig.panelSize.height * PageConfig.SquareSize.height
        })
        this.nextDom.css({
            width: GameConfig.nextSize.width * PageConfig.SquareSize.width,
            height: GameConfig.nextSize.height * PageConfig.SquareSize.height
        })
        $(document).on('keydown', (e) => {
            switch (e.key) {
                case "ArrowUp":
                    game.controlRotate();
                    break;
                case "ArrowLeft":
                    game.controlToLeft();
                    break;
                case "ArrowRight":
                    game.controlToRight();
                    break;
                case "ArrowDown":
                    game.controlToDown();
                    break;
                case " ":
                    if (game.gameStatus === GameStatus.playing) {
                        game.pause();
                    } else {
                        game.start();
                    }
                    break;
            }
        })
    }

    showScore(score: number) {
        this.scoreDom.html("计分器：" + score);
    }

    //设置下一个方块组
    showNext(teters: SquareGroup): void {
        //遍历方块组
        teters.squares.forEach(sq => {
            //将新的视图对象赋值给sq.viewer方块组元素
            sq.viewer = new SquarePageViewer(sq, this.nextDom);
        })
    }

    //切换当前下落方块组
    switch(teters: SquareGroup): void {
        //遍历方块组
        teters.squares.forEach(sq => {
            //将每一个方块组元素的显示移除
            if (sq.viewer) {
                sq.viewer.remove();
            }
            //将新的视图对象赋值给sq.viewer方块组元素
            sq.viewer = new SquarePageViewer(sq, this.panelDom);
        })
    }

    onGameOver(): void {
         this.msgDom.css({
            display: "flex"
        });
        this.msgDom.find("p").html("游戏结束");
    }

    onGamePause(): void {
        this.msgDom.css({
            display: "flex"
        });
        this.msgDom.find("p").html("游戏暂停");
    }

    onGameStart(): void {
          this.msgDom.hide();
    }
}