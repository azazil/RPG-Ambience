var ViewModel = function(editorWidth) {
	var self = this;
	
	self.start = function() {
		startAmbience();
		startInterface();
	}
	
	var ambience;
	function startAmbience() {
		ambience = new Ambience(
			new Ambience.Layer(document.getElementById('background')),
			new Ambience.Layer(document.getElementById('foreground'))
		);
	}
	
	self.adventure = new AdventureViewModel(self);
	self.playScene = function(scene) {
		converted = self.adventure.convertScene(scene);
		ambience.play(converted);
	};
	
	function startInterface() {
		self.splitter = new Splitter(document.body, editorWidth);
		
		var appIsRunLocally = window.location.protocol === 'file:';
		if ( !appIsRunLocally ) {
			self.message('To access local files, <a href="">download RPG Ambience</a> and run it from your hard drive.');
		}
		
		document.addEventListener('keypress', self.onKeyPress);
		document.addEventListener('keydown', self.onKeyDown);
		
		var theaterForm = document.getElementById('theater-form');
		var showInterface = function(event) {
			event.stopPropagation();
			self.showInterface();
		};
		theaterForm.addEventListener('mousemove', showInterface);
		theaterForm.addEventListener('mouseover', showInterface)
	}
	
	self.message = ko.observable(null);
	self.clearMessage = function() {
		self.message(null);
	};
	
	self.editorWidth = editorWidth;
	self.editorIsVisible = ko.observable(true);
	self.editorIsHidden = ko.computed(function() {
		return !self.editorIsVisible();
	});
	self.interfaceIsVisible = ko.observable(true);
	
	self.hideEditor = function() {
		self.editorWidth = self.splitter.leftWidth;
		self.editorIsVisible(false);
		self.splitter.update(0);
	};
	
	self.showEditor = function() {
		self.splitter.update(self.editorWidth);
		self.editorIsVisible(true);
	};
	
	var theater = document.getElementById('theater');
	var cursorTimer;
	var cursorHideDelay = 1000;
	var previousX;
	var previousY;
	
	self.hideInterface = function() {
		theater.style.cursor = 'none';
		self.interfaceIsVisible(false);
	};

	self.showInterface = function() {
		clearTimeout(cursorTimer);
		theater.style.cursor = 'auto';
		self.interfaceIsVisible(true);
	}
	
	self.scheduleHiddenInterface = function(viewModel, event) {
		// Setting the cursor style seems to trigger a mousemove event, so we have to make sure that the mouse has really moved or we will be stuck in an infinite loop.
		var mouseHasMoved = event.screenX !== previousX || event.screenY !== previousY;
		if ( mouseHasMoved ) {
			self.showInterface();
			cursorTimer = window.setTimeout(self.hideInterface, cursorHideDelay);
		}

		previousX = event.screenX;
		previousY = event.screenY;
	};
	
	var formTagNames = ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'OPTION', 'A'];
	var focusIsOnForm = function(event) {
		return formTagNames.indexOf(event.target.tagName) !== -1;
	};
	
	self.onKeyDown = function(event) {
		if ( !focusIsOnForm(event) ) {
			var key = Key.name(event.keyCode);
			if ( self.commands[key]  ) {
				event.preventDefault();
				self.commands[key]();
			} else {
				var scene = self.adventure.keyedScene(key);
				if ( scene ) {
					event.preventDefault();
					self.playScene(scene);
				}
			}
		}
	};
	
	self.sceneName = ko.observable('');
	self.onKeyPress = function(event) {
		// Firefox handles charCode 0 as a string so we guard against it here.
		if ( !focusIsOnForm(event) && event.charCode !== 0 ) {
			var character = String.fromCharCode(event.charCode);
			var scene = self.adventure.keyedScene(character.toUpperCase());
			if ( scene ) {
				self.playScene(scene);
				self.sceneName('');
			} else if ( character ) {
				self.sceneName(self.sceneName() + character);
			}
		}
	};
	
	self.backspaceSceneName = function() {
		if ( self.sceneName().length > 0 ) {
			self.sceneName(self.sceneName().substring(0, self.sceneName().length - 1));
		}
	};
	
	self.playNamedScene = function() {
		if ( self.sceneName().length === 0 ) {
			ambience.fadeOutTopmost();
		} else {
			var scene = self.adventure.namedScene(self.sceneName());
			if ( scene ) {
				self.playScene(scene);
			}
			self.sceneName('');
		}
	};
	
	self.commands = {
		'Enter': self.playNamedScene,
		'Backspace': self.backspaceSceneName,
		'Escape': function() {}
	};
};

window.addEventListener('load', function() {
	var viewModel = new ViewModel(0.6);
	viewModel.start();
	ko.applyBindings(viewModel);
	viewModel.adventure.add();
});