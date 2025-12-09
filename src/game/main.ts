import { AUTO, Game } from 'phaser'
import { Boot } from './scenes/Boot'
import { Game as MainGame } from './scenes/Game'
import { GameOver } from './scenes/GameOver'
import { Preloader } from './scenes/Preloader'

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
	type: AUTO,
	width: window.innerWidth,
	height: window.innerHeight,
	mode: Phaser.Scale.NONE,
	pixelArt: true,
	parent: 'game-container',
	backgroundColor: '#028af8',
	scene: [Boot, Preloader, MainGame, GameOver],
}

const StartGame = (parent: string) => {
	const game = new Game({ ...config, parent })
	window.addEventListener('resize', () => {
		game.scale.resize(window.innerWidth, window.innerHeight)
	})
	return game
}

export default StartGame
