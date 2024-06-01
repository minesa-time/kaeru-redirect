import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import fs from "fs";
import path from "path";

const currentFilePath = import.meta.url;
const currentDirPath = path.dirname(
    currentFilePath.replace(/^file:[/][/]/, "")
);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
config();

import * as discord from "./discord.js";
import * as storage from "./storage.js";

const app = express();
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static("public"));

const linkedRoleFilePath = path.resolve(
    currentDirPath,
    "./data/linked-role.json"
);
export function getLinkedRoleData() {
    try {
        const data = fs.readFileSync(linkedRoleFilePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading linked-role.json:", err);
        return {};
    }
}

// Function to check if the role and user ID match
export function isRoleClaimValid(roleName, userId) {
    const linkedRoleData = getLinkedRoleData();
    console.log(linkedRoleData[roleName]?.includes(userId));
    return linkedRoleData[roleName]?.includes(userId) || false;
}

app.get("/", (req, res) => {
    res.send("👋");
});

app.get("/linked-role", async (req, res) => {
    const { url, state } = discord.getOAuthUrl();

    res.cookie("clientState", state, { maxAge: 1000 * 60 * 5, signed: true });

    res.redirect(url);
});

app.get("/discord-oauth-callback", async (req, res) => {
    try {
        const code = req.query["code"];
        const discordState = req.query["state"];

        const { clientState } = req.signedCookies;
        if (clientState !== discordState) {
            console.error("State verification failed.");
            return res.sendStatus(403);
        }

        const tokens = await discord.getOAuthTokens(code);

        const meData = await discord.getUserData(tokens);
        const userId = meData.user.id;
        await storage.storeDiscordTokens(userId, {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
        });

        await updateMetadata(userId);

        res.sendFile(path.resolve(__dirname, "discord-oauth-callback.html"));
    } catch (e) {
        console.error(e);
        res.sendStatus(500);
    }
});

app.post("/update-metadata", async (req, res) => {
    try {
        const userId = req.body.userId;
        await updateMetadata(userId);

        res.sendStatus(204);
    } catch (e) {
        res.sendStatus(500);
    }
});

async function updateMetadata(userId) {
    const tokens = await storage.getDiscordTokens(userId);

    let metadata = {};
    try {
        metadata = {
            ismica: isRoleClaimValid("1246561256609943675", userId),
            isneo: isRoleClaimValid("1246537610583609518", userId),
            issaku: isRoleClaimValid("1246561161495973958", userId),
            ismoderator: isRoleClaimValid("1246555145836433593", userId),
        };
    } catch (e) {
        e.message = `Error fetching external data: ${e.message}`;
        console.error(e);
    }
    await discord.pushMetadata(userId, tokens, metadata);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
