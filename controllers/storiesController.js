const express = require('express')
const router = express.Router()
const {ensureAuth, ensureGuest} = require('../middleware/auth')
const Story = require('../models/story')


// @desc    Show add page
// @route   GET /stories/add
const  show_add_stories_page =  function(req, res){
    res.render('stories/add')
}

// @desc    Process the add form
// @route   GET /stories/dashboard
const process_add_form = async function(req, res){
    try{
        req.body.user = req.user.id;
        await Story.create(req.body)
        res.redirect('/dashboard')
    }catch(err){
        console.log(err)
        res.render('error/500')
    }
    res.render('stories/add')
}

// @desc    Show all stories
// @route   GET /stories
const show_all_stories = async function(req, res) {
    try{
        const stories = await Story.find({status: 'public'})
            .populate('user')
            .sort({createdAt: 'desc'})
            .lean()
        res.render('stories/index',{
            name: req.user.displayName,
            image: req.user.image,
            id: req.user.id,
            stories,
        })
    }catch(err){
        console.log(err)
        res.render('error/500')
    }
}

// @desc    Show single story
// @route   GET /stories/:id
const show_single_story = async function(req, res){
    try {
        const  story = await Story.findById(req.params.id)
            .populate('user').lean()
        if (!story)
        {
            res.render('error/404')
        }
        res.render('stories/show',{
            name: req.user.displayName,
            image: req.user.image,
            id: req.user.id,
            story
        })
    }catch(err)
    {
        console.log(err)
        res.render('error/404')
    }

}


// @desc    Show single story
// @route   GET public /stories/:id
const show_single_public_story = async function(req, res){
    try {
        const  story = await Story.findById(req.params.id)
            .populate('user').lean()
        if (!story)
        {
            res.render('error/404')
        }
        res.render('stories/public/show',{
            // name: req.user.displayName,
            // image: req.user.image,
            // id: req.user.id,
            story
        })
    }catch(err)
    {
        console.log(err)
        res.render('error/404')
    }

}

// @desc    Show edit page
// @route   GET /stories/edit/:id
const show_edit_page = async function(req, res){
    try {
        const story = await Story.findOne({
            _id: req.params.id,
        }).lean()

        if (!story) {
            return res.render('error/404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/edit', {
                name: req.user.displayName,
                image: req.user.image,
                id: req.user.id,
                story,
            })
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
}


// @desc    Update story
// @route   PUT /stories/:id
const update_story = async function(req, res){
    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            return res.render('error/404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true,
            })

            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
}

// @desc    Delete Story
// @route   DELETE /stories/:id
const delete_story = async function(req, res){
    try{
        let story = await Story.findById({_id: req.params.id})
        if (!story)
        {
            res.redirect('error/500')
        }if (story.user != req.user.id) {
            res.redirect('/stories')
        }else{
            await Story.remove({_id: req.params.id})
            res.redirect('/dashboard')
        }

    }catch(error){
        console.error(err)
        return res.render('error/500')
    }
}


// @desc    User stories
// @route   GET /stories/user/:userId
const user_story = async function(req, res){
    try {
        const stories = await Story.find({
            user: req.params.userId,
            status: 'public',
        })
            .populate('user')
            .lean()
        res.render('stories/index',{
            name: req.user.displayName,
            image: req.user.image,
            id: req.user.id,
            stories
        })
    }catch(err)
    {
        console.error(err);
        res.render('error/500')
    }

}

module.exports = {
    show_add_stories_page,
    show_single_public_story,
    process_add_form,
    show_all_stories,
    show_single_story,
    show_edit_page,
    update_story,
    delete_story,
    user_story
}

