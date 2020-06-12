const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const mongooseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [
                40,
                'A tour name must have less or equal then 40 characters',
            ],
            minlength: [
                10,
                'A tour name must have more or equal then 10 characters',
            ],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this only points to current doc on NEW document creation
                    return val < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

mongooseSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

//DOCUMENT MIDDLEWARE - used to manipulate the document currently being processed
//Pre: - runs before .save() and .create()
mongooseSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    console.log(this);
    next();
});

mongooseSchema.pre('save', function (next) {
    console.log('saving the document in database');
    next();
});

//Post: - runs after .save() and .create()
mongooseSchema.post('save', function (doc, next) {
    console.log(doc);
    next();
});

//QUERY MIDDLEWARE - used to manipulate the find query.
//Pre: runs before find()
mongooseSchema.pre('find', function (next) {
    this.find({ secretTour: { $ne: true } });
    //setting property on query object:
    this.start = Date.now();
    next();
});

//Post: runs after find()
mongooseSchema.post('find', function (docs, next) {
    console.log(
        `The time it took to excute query: ${
            Date.now() - this.start
        } milliseconds!`
    );
    console.log(docs);
    next();
});

//AGGREGATE MIDDLEWARE - used to manipulate the aggregate query.
mongooseSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

const Tour = mongoose.model('Tour', mongooseSchema);

//Creating the Document using save method.
/*const testTour = new Tour({
    name: 'The Forest Hiker',
    rating: 4.8,
    price: 4200.88,
});

testTour
    .save()
    .then((doc) => console.log(doc))
    .catch((err) => console.log('error: ✴️', err));
*/

module.exports = Tour;
