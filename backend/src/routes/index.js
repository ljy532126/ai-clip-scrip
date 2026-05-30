const express = require('express')
const router = express.Router()

const generateController = require('../controller/generateController')
const userController = require('../controller/userController')
const toolboxController = require('../controller/toolboxController')
const adminController = require('../controller/adminController')

// 生成相关
router.post('/generate', generateController.generate)
router.get('/history', generateController.history)
router.get('/record/:id', generateController.getRecord)
router.delete('/record/:id', generateController.deleteRecord)

// 下载
router.get('/download/:filename', generateController.downloadSingle)
router.get('/download-zip/:id', generateController.downloadZip)

// 用户
router.post('/user/login', userController.login)
router.post('/user/register', userController.register)
router.get('/user/info', userController.getInfo)
router.post('/user/favorite', userController.addFavorite)
router.post('/user/unfavorite', userController.removeFavorite)
router.get('/user/favorites', userController.getFavorites)
router.get('/user/mystats', userController.getMyStats)
router.post('/user/password', userController.changePassword)
router.post('/user/avatar', userController.updateAvatar)
router.get('/admin/users', userController.adminListUsers)
router.post('/admin/user/ban', userController.adminToggleBan)

// 工具箱
router.post('/toolbox/subtitle', toolboxController.subtitle)
router.post('/toolbox/polish', toolboxController.polish)
router.post('/toolbox/storyboard', toolboxController.storyboard)

// 后台管理
router.get('/admin/prompts', adminController.getPrompts)
router.put('/admin/prompt/:id', adminController.updatePrompt)
router.get('/admin/stats', adminController.getStats)

// 公告
router.get('/announcements', adminController.getAnnouncements)
router.post('/admin/announcement', adminController.createAnnouncement)
router.delete('/admin/announcement/:id', adminController.deleteAnnouncement)
router.post('/announcement/read', adminController.markAnnouncementRead)

// LLM大模型配置
router.get('/admin/llm', adminController.getLLMConfigs)
router.post('/admin/llm', adminController.createLLMConfig)
router.put('/admin/llm/:id', adminController.updateLLMConfig)
router.delete('/admin/llm/:id', adminController.deleteLLMConfig)
router.post('/admin/llm/:id/activate', adminController.activateLLMConfig)
router.post('/admin/llm/test', adminController.testLLM)

module.exports = router
