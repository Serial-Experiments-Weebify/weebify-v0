<template>
    <div class="send-to-sync">
        <a href="#" class="show-menu" @click.prevent="showMenu">
            Send to Sync
        </a>
        <iframe
            v-if="enabled"
            :src="syncapi"
            frameborder="0"
            ref="frame"
        ></iframe>
        <div class="menu" v-if="menu">
            <span class="close" @click="close"> Close </span>
            <span
                v-for="roomid in rooms"
                class="room"
                :key="roomid"
                @click="
                    () => {
                        sendToRoom(roomid);
                    }
                "
                >{{ roomid }}</span
            >
        </div>
    </div>
</template>

<script>
export default {
    refs: {
        frame: {
            type: "iframe",
            ref: "frame",
        },
    },
    props: ["url"],
    data() {
        return {
            syncapi: import.meta.env.VITE_FRAME_API,
            enabled: false,
            menu: false,
            rooms: [],
        };
    },
    methods: {
        async showMenu() {
            this.menu = true;

            if (this.enabled) {
                this.$refs.frame.contentWindow.postMessage(
                            ["getrooms"],
                            "*"
                        );
            } else {
                this.enabled = true;
                this.$nextTick(() => {
                    window.onmessage = this.onReply;
                    this.$refs.frame.onload = () => {
                        this.$refs.frame.contentWindow.postMessage(
                            ["getrooms"],
                            "*"
                        );
                    };
                });
            }
        },
        onReply(r) {
            switch (r.data[0]) {
                case "roomsreply":
                    this.rooms = r.data[1];
                    break;
            }
        },
        sendToRoom(id) {
            this.$refs.frame.contentWindow.postMessage(
                ["setmedia", id, "cdn", this.url],
                "*"
            );
            this.menu = false;
        },
        close() {
            this.menu = false;
        },
    },
};
</script>

<style lang="less">
.send-to-sync {
    .show-menu {
        display: block;
        margin: 0.5rem;
        color: #5abeed;
    }

    position: relative;
    display: block;
    width: fit-content;

    iframe {
        display: none;
    }

    .menu {
        .close {
            color: #e35e6e;
            cursor: pointer;
        }

        .room {
            color: #5abeed;
            cursor: pointer;
        }

        display: flex;
        flex-direction: column;
        position: absolute;
        top: 0;
        min-width: 100%;
        background-color: #262440;
        border: 1px solid #5abeed;
        border-radius: 3px;
        padding: 0.3rem;
    }
}
</style>
