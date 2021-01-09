//We required mongoose and campground

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const Cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error'));
db.once("open", () => {
    console.log('Database connected');
});

/******************INITIALIZATION STUFF ENDS HERE******************************************************************************/

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 150; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            geometry: { 
                type: 'Point', 
                coordinates: [Cities[random1000].longitude, Cities[random1000].latitude] 
                    },
            author: '5ff3d7e2bb8d211f8ceb0936' ,
            location: `${Cities[random1000].city}, ${Cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quis, itaque! Nemo rerum saepe natus officia commodi doloribus est quos quia perspiciatis ex, vel labore, expedita maxime aperiam laborum recusandae error?',
            price: price,
            images: [
                    {
                        url: 'https://res.cloudinary.com/dhc3gjs1e/image/upload/v1610000084/YelpCamp/rptoyztekicth5acgrca.jpg',
                        filename: 'YelpCamp/rptoyztekicth5acgrca'
                    },
                    {
                        url: 'https://res.cloudinary.com/dhc3gjs1e/image/upload/v1610000084/YelpCamp/bkbqkctea3xldhjtzquo.jpg',
                        filename: 'YelpCamp/bkbqkctea3xldhjtzquo'
                    },
                ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
}).catch((err)=>{
    console.log("ERROR");
    console.log(err);
});