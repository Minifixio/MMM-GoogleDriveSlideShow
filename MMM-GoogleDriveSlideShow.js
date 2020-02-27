Module.register("MMM-GoogleDriveSlideShow", {

	defaults: {
		rootFolderId: "root", // Google Drive root folder id, or 'root' for root folder
		maxFolders: 30, // Maximum number of folders to scan
		maxResults: 10, // Maximum of images to load
		playMode: "AUTO", // Mode of play : AUTO (automatic) or NOTIFICATION (only on the notification configured "nextOnNotification")
		nextOnNotification: null,  // Change image when this notification is received
		stopOnNotification: null, // Stop slideshow when this notification is receveived
		startOnNotification: null, // Start slideshow when this notification is received (or next photo if playMode = NOTIFICATION)
		preloadNextOnStop: false, // Special configuration for PIR module, allowing to preload the next image just after the screen is off, to be ready when screen is on
		refreshDriveDelayInSeconds: 24 * 3600, // How often Google Drive cache is refresh (fetch new photos)
		refreshSlideShowIntervalInSeconds: 10, // How often the image on the slideshow is refreshed
		showWidth: "100%", // how large the photo will be shown as.
		showHeight: "100%",
		minWidth: "800px", // how large the photo will be shown as.
		minHeight: "600px",
		opacity: 1, // resulting image opacity. Consider reducing this value if you are using this module as a background picture frame
		mode: "contain", // "cover" or "contain",
		debug: false, // To display or not debug message in logs
	},

	getStyles: function () {
		return ["MMM-GoogleDriveSlideShow.css"];
	},

	start: function() {
		this.sendSocketNotification("INIT", this.config);
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.id = "gDriveSlideShow";
		wrapper.style.width = this.config.showWidth;
		wrapper.style.height = this.config.showHeight;
		wrapper.style.minWidth = this.config.minWidth;
		wrapper.style.minHeight = this.config.minHeight;
		wrapper.style.backgroundSize = this.config.mode;
		return wrapper;
	},

	showImage: function(imageId) {
		var url = "/MMM-GoogleDriveSlideShow/file/" + imageId;
		var image = document.getElementById("gDriveSlideShow");

		image.style.opacity = 0;
		setTimeout(()=>{
			image.style.backgroundImage = "unset";
			image.style.backgroundImage = "url('" + url + "')";
			image.style.opacity = this.config.opacity;
			if (this.config.mode == "hybrid") {
				var rect = image.getBoundingClientRect();
				var rr = ((rect.width / rect.height) > 1) ? "h" : "v";
				var ir = ((payload.width / payload.height) > 1) ? "h" : "v";
				image.style.backgroundSize = (rr == ir) ? "cover" : "contain";
			} else {
				image.style.backgroundSize = this.config.mode;
			}
		}, 2000);

	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
		case "NEW_IMAGE":
			this.showImage(payload);
			break;
		}
	},

	notificationReceived: function(notification, payload, sender) {
		if(this.config.debug){
			Log.info("Notification received :", notification, payload, sender);
		}

		switch(notification) {
		case this.config.nextOnNotification:
			this.sendSocketNotification("REQUEST_NEW_IMAGE", null);
			break;
		case this.config.stopOnNotification:
			this.sendSocketNotification("STOP_SLIDESHOW", null);
			break;
		case this.config.startOnNotification:
			this.sendSocketNotification("START_SLIDESHOW", null);
			break;
		}

	}
});
