// This file is part of Ambience Stage
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

describe('Ambience stage', function() {
	var stage;
	var stageNode;
	
	beforeEach(function() {
		stageNode = document.createElement('div');
		document.body.appendChild(stageNode);
		stage = new Ambience.Stage(stageNode);
	});
	
	afterEach(function() {
		document.body.removeChild(stageNode);
	});
	
	it('stops current scene when starting new scene', function() {
		var scene = new Ambience.Scene(['Image']);
		scene.image.url = 'test-image.jpg';
		stage.play(scene);
		
		var newScene = new Ambience.Scene(['Image']);
		scene.image.url = 'test-image.jpg';
		stage.play(scene);
		
		expect(stage.imageCount).toBe(1);
	});
	
	it("fades the entire stage's opacity", function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.fade.in = 1000;
			stage.play(scene);
		});
		
		waits(500);
		
		runs(function() {
			// If CSS transitions are used, this has to be changed to getComputedStyle.
			// We're using a fairly generous interval for the opacity.
			expect(stage.opacity).toBeGreaterThan(0.25);
			expect(stage.opacity).toBeLessThan(0.75);
		});
		
		waits(1000);
		
		runs(function() {
			expect(stage.opacity).toBeGreaterThan(0.9);
		});
	});
	
	it('stops all media after fading out', function() {
		runs(function() {
			var scene = new Ambience.Scene(['Background', 'Image', 'Sound', 'Text']);
			scene.fade.in = scene.fade.out = 1000;
			scene.background.color = 'red';
			scene.image.url = 'test-image.jpg';
			scene.sound.tracks = ['test-audio.ogg'];
			scene.text.string = 'Test';
			
			stage.play(scene);
			
			expect(stage.background).toBe('red');
			expect(stage.imageCount).toBe(1);
			expect(stage.soundCount).toBe(1);
			expect(stage.textCount).toBe(1);
		});
		
		waits(1500);
		
		runs(function() {
			stage.fadeOut();
		});
		
		waits(1500);
		
		runs(function() {
			expect(stage.background).toBe('black');
			expect(stage.imageCount).toBe(0);
			expect(stage.soundCount).toBe(0);
			expect(stage.textCount).toBe(0);
		});
	});

	it('interrupts scene that is fading out', function() {
		runs(function() {
			var scene = new Ambience.Scene(['Image']);
			scene.image.url = 'test-image.jpg';
			scene.fade.out = 1000;
			stage.play(scene);
			stage.fadeOut();
		});

		waits(500);

		runs(function() {
			stage.stop();
			expect(stage.opacity).toBe(0);
			expect(stageNode.style.visibility).toBe('hidden');
			expect(stage.sceneIsPlaying).toBe(false);
		});
	});
});