import fetch from "node-fetch";
import { config } from "dotenv";
config();

const url = `https://discord.com/api/v10/applications/${process.env.CLIENT_ID}/role-connections/metadata`;
// supported types: number_lt=1, number_gt=2, number_eq=3 number_neq=4, datetime_lt=5, datetime_gt=6, boolean_eq=7, boolean_neq=8
const body = [
    {
        key: "ismica",
        name: "nom nomer",
        description: "Only for Mica. No need to try.",
        type: 7,
    },
    {
        key: "isneo",
        name: "Daddy",
        description: "🫵🏻",
        type: 7,
    },
    {
        key: "issaku",
        name: "Men Hater",
        description: "Saku, the men hater.",
        type: 7,
    },
    {
        key: "ismoderator",
        name: "Moderator",
        description: "You must be one of moderator 🥰",
        type: 7,
    },
];

const response = await fetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${process.env.TOKEN}`,
    },
});
if (response.ok) {
    const data = await response.json();
    console.log(data);
} else {
    const data = await response.text();
    console.log(data);
}
