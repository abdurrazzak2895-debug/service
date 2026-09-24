import mongoose from "mongoose";
import dotenv from "dotenv";
import Game from "../models/Game.js";
import Sport from "../models/Sport.js";
import GameCategory from "../models/GameCategory.js";
import GameProvider from "../models/GameProvider.js";

dotenv.config();
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bajiman";

const B = "https://static.prod-images.emergentagent.com/jobs/40967c6c-9fd4-45f1-970c-7a219d69e691/images/";
const gameImg = {
  "joker-lucky-gold": B + "69bbcd9c22f48c5f181747102bf6138ab9dc2efcf643130796faecac00d6bc45.jpeg",
  "joker-royal-win": B + "ef95990431ccc5b3dadf33a537f3a577f07f59da460d6e749511f0af5b78bc15.jpeg",
  "pragmatic-aztec": B + "ae4845ccb7cf7b583ce040113fcd50da132c8b60bca1ceda07c5713e25eaa0eb.jpeg",
  "pragmatic-sweet-bonanza": B + "4c90372b45cf84ba054a9582c66e58bc443cfe846f72c4b80a9df470128fbb1d.jpeg",
  "pgsoft-cash-pool": B + "163acd0a159b0ce519f62cc40d9d373af4da631b76949325fab4021e9642abf8.jpeg",
  "pgsoft-galaxy-queen": B + "07431a798090bd3777c5e507ca983e5995138db05bc96148d7041095d0f46d81.jpeg",
  "pgsoft-lucky-dragons": B + "35b1f23c6c9bc8c38301667e59493c10790cd35c56b7e176451aeea21550598c.jpeg",
  "fish-lagoon-burst": B + "e3540c345424058d029f36358fd9d71bebd9030745cc9fdf3b51b255f64d9d5a.jpeg",
  "fish-deep-ocean": B + "237a629b379ec43bcdbabad6bbdcd8c0efb7d20a8fadcb1c8ec2524f8b66a95e.jpeg",
  "sports-football-fiesta": "https://images.pexels.com/photos/32190700/pexels-photo-32190700.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "sports-cricket-master": "https://images.pexels.com/photos/29463867/pexels-photo-29463867.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "sports-basket-glory": "https://images.pexels.com/photos/28773512/pexels-photo-28773512.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

// category key (by en name) -> icon
const catIcon = {
  "Casino": B + "ef95990431ccc5b3dadf33a537f3a577f07f59da460d6e749511f0af5b78bc15.jpeg",
  "Slots": B + "69bbcd9c22f48c5f181747102bf6138ab9dc2efcf643130796faecac00d6bc45.jpeg",
  "Fishing": B + "e3540c345424058d029f36358fd9d71bebd9030745cc9fdf3b51b255f64d9d5a.jpeg",
  "Sports": "https://images.pexels.com/photos/32190700/pexels-photo-32190700.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400",
};

const run = async () => {
  await mongoose.connect(mongoUri);
  for (const [uid, image] of Object.entries(gameImg)) {
    await Game.updateOne({ gameUId: uid }, { $set: { image } });
    await Sport.updateOne({ gameId: uid }, { $set: { iconImage: image } });
  }
  for (const [en, iconImage] of Object.entries(catIcon)) {
    await GameCategory.updateOne({ "categoryName.en": en }, { $set: { iconImage } });
  }
  console.log("Images updated:", Object.keys(gameImg).length, "games");
  await mongoose.disconnect();
};
run().catch((e) => { console.error(e); process.exit(1); });
