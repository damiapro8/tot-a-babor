export class NetworkManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.otherPlayers = {};
        this.initSocket();
    }

    initSocket() {
        this.socket = io();
        
        this.socket.on("state", (players) => {
            this.handlePlayersUpdate(players);
        });
    }

    handlePlayersUpdate(players) {
        // Actualitzar o crear jugadors
        for (let id in players) {
            if (id !== this.socket.id) {
                if (!this.otherPlayers[id]) {
                    this.createOtherPlayer(id, players[id]);
                } else {
                    this.updateOtherPlayer(id, players[id]);
                }
            }
        }

        // Eliminar jugadors desconectats
        for (let id in this.otherPlayers) {
            if (!players[id]) {
                this.removeOtherPlayer(id);
            }
        }
    }

    createOtherPlayer(id, playerData) {
        const sprite = this.scene.physics.add.sprite(playerData.x, playerData.y, 'jugador');
        sprite.body.allowGravity = false;
        sprite.setAlpha(0.8);
        sprite.setDepth(0);
        sprite.setImmovable(true);
        this.scene.physics.add.collider(this.player.sprite, sprite);

        const label = this.scene.add.text(
            playerData.x, 
            playerData.y - 80, 
            playerData.nom || "Jugador", 
            {
                fontSize: '20px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 6, y: 3 }
            }
        ).setOrigin(0.5)
         .setDepth(1000);

        this.otherPlayers[id] = { sprite, label };
    }

    updateOtherPlayer(id, playerData) {
        const otherPlayer = this.otherPlayers[id];
        otherPlayer.sprite.setPosition(playerData.x, playerData.y);
        otherPlayer.label.setPosition(playerData.x, playerData.y - 80);
        otherPlayer.label.setText(playerData.nom || "Jugador");
    }

    removeOtherPlayer(id) {
        this.otherPlayers[id].sprite.destroy();
        this.otherPlayers[id].label.destroy();
        delete this.otherPlayers[id];
    }

    update() {
        if (this.socket && this.socket.connected) {
            this.socket.emit("update", {
                x: this.player.sprite.x,
                y: this.player.sprite.y,
                nom: this.player.name
            });
        }
    }
}