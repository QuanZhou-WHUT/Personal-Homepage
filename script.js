// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 1. 设置当前年份
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 月份从0开始
    const day = now.getDate();
    document.getElementById('currentDate').textContent = `${year}.${month}.${day}`;
    
    // 2. 移动端菜单切换
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = this.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // 3. 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 如果是移动端菜单，点击后关闭菜单
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (mobileMenuBtn) {
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 4. 出版物年份筛选
    const yearButtons = document.querySelectorAll('.year-btn');
    const publicationItems = document.querySelectorAll('.publication-item');
    
    yearButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            yearButtons.forEach(btn => btn.classList.remove('active'));
            // 为当前点击的按钮添加active类
            this.classList.add('active');
            
            const selectedYear = this.getAttribute('data-year');
            
            // 显示/隐藏出版物
            publicationItems.forEach(item => {
                if (selectedYear === 'all' || item.getAttribute('data-year') === selectedYear) {
                    item.style.display = 'flex';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // 5. 导航栏滚动效果
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
    
    // 6. 高亮当前活动导航项
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    function highlightNavItem() {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = sectionId;
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavItem);
    // 7. 视频内嵌播放 + 模态框放大（支持本地视频和B站嵌入，带声音）
    (function() {
        const videoCards = document.querySelectorAll('.video-card');
        const modal = document.getElementById('video-modal');
        const modalWrapper = document.getElementById('modal-video-wrapper');
        const modalClose = document.querySelector('.modal-close');
        const modalBackdrop = document.querySelector('.modal-backdrop');

        if (!modal || !modalWrapper) {
            console.error('视频模态框结构缺失！');
            return;
        }

        /**
         * 打开全屏模态框
         * @param {string} videoSrc   视频源
         * @param {string} videoType  'video' 或 'embed'
         * @param {number} currentTime 起始播放秒数（仅对本地视频有效）
         * @param {boolean} startMuted 是否静音（内嵌转放大时，可保持声音）
         */
        function openModal(videoSrc, videoType, currentTime = 0, startMuted = false) {
            modalWrapper.innerHTML = '';

            if (videoType === 'embed') {
                let embedUrl = videoSrc;
                if (videoSrc.includes('bilibili.com/video/')) {
                    let bvid = videoSrc.split('/video/')[1];
                    if (bvid) {
                        bvid = bvid.split('/')[0].split('?')[0];
                        embedUrl = `//player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&autoplay=1`;
                    }
                }
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.allowFullscreen = true;
                iframe.allow = 'autoplay; encrypted-media';
                iframe.style.border = 'none';
                modalWrapper.appendChild(iframe);
            } else {
                const video = document.createElement('video');
                video.src = videoSrc;
                video.controls = true;
                video.muted = startMuted;   // 从内嵌放大时通常不静音
                video.autoplay = true;
                video.playsInline = true;
                video.style.width = '100%';
                video.style.display = 'block';
                video.style.background = '#000';
                 video.addEventListener('error', function() {
                    modalWrapper.innerHTML = '<p style="color:white; text-align:center; padding:2rem;">⚠️ 视频加载失败</p>';
                });

                video.addEventListener('loadedmetadata', function() {
                    if (currentTime > 0 && Number.isFinite(video.duration)) {
                        video.currentTime = Math.min(currentTime, video.duration - 0.1);
                    }
                
                    video.play().catch(err => console.warn('模态框自动播放失败', err));
                }, { once: true });
                
                video.addEventListener('error', function() {
                    console.error('模态框视频加载失败:', videoSrc, video.error);
                    modalWrapper.innerHTML = '<p style="color:white; text-align:center; padding:2rem;">⚠️ 视频加载失败</p>';
                });
                
                modalWrapper.appendChild(video);
                video.load();
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            modalWrapper.innerHTML = '<p style="color:#fff; text-align:center; padding:2rem;">加载中...</p>';
        }

        /**
         * 在卡片内部启动内嵌播放
         */
        function playInline(card) {
            const videoSrc = card.getAttribute('data-video-src');
            const videoType = card.getAttribute('data-video-type') || 'video';
            if (!videoSrc) return;

            const inlinePlayer = card.querySelector('.inline-player');
            if (!inlinePlayer) return;

            // 清空之前的内容
            inlinePlayer.innerHTML = '';

            if (videoType === 'embed') {
                // 创建 B 站 iframe
                let embedUrl = videoSrc;
                if (videoSrc.includes('bilibili.com/video/')) {
                    let bvid = videoSrc.split('/video/')[1];
                    if (bvid) {
                        bvid = bvid.split('/')[0].split('?')[0];
                        embedUrl = `//player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&autoplay=1`;
                    }
                }
                const iframe = document.createElement('iframe');
                iframe.src = embedUrl;
                iframe.allowFullscreen = true;
                iframe.allow = 'autoplay; encrypted-media';
                iframe.style.border = 'none';
                inlinePlayer.appendChild(iframe);
            } else {
                // 本地视频 -> <video>
                const video = document.createElement('video');
                video.src = videoSrc;
                video.controls = true;
                video.muted = false;        // 有声音
                video.autoplay = true;
                video.playsInline = true;
                inlinePlayer.appendChild(video);

                video.play().catch(err => console.warn('内嵌自动播放失败', err));

                // 播放结束后恢复缩略图
                video.addEventListener('ended', function() {
                    card.classList.remove('playing');
                    inlinePlayer.innerHTML = '';
                }, { once: true });
            }

            card.classList.add('playing');
        }

        // 绑定卡片事件
        videoCards.forEach(card => {
            // 卡片点击（启动内嵌播放）
            card.addEventListener('click', function(e) {
                // 如果点击放大按钮本身，不处理
                if (e.target.closest('.expand-btn')) return;

                // 如果已经在播放，不做任何事（避免干扰内嵌播放器交互）
                if (card.classList.contains('playing')) return;

                playInline(card);
            });

            // 放大按钮事件
            const expandBtn = card.querySelector('.expand-btn');
            if (expandBtn) {
                expandBtn.addEventListener('click', function(e) {
                    e.stopPropagation();  // 阻止触发卡片点击
                    const videoSrc = card.getAttribute('data-video-src');
                    const videoType = card.getAttribute('data-video-type') || 'video';
                    const inlinePlayer = card.querySelector('.inline-player');

                    let currentTime = 0;
                    let wasMuted = false;

                    // 如果是本地视频，获取当前进度和静音状态
                    if (videoType === 'video') {
                        const inlineVideo = inlinePlayer.querySelector('video');
                        if (inlineVideo) {
                            currentTime = inlineVideo.currentTime;
                            wasMuted = inlineVideo.muted;
                            inlineVideo.pause();   // 暂停内嵌，避免声音冲突
                        }
                    }

                    // 打开模态框，传递当前时间和声音状态
                    openModal(videoSrc, videoType, currentTime, wasMuted);

                    // 模态框关闭后，恢复内嵌播放（仅本地视频）
                    if (videoType === 'video') {
                        const onceClose = function() {
                            const inlineVideo = inlinePlayer.querySelector('video');
                            if (inlineVideo && inlineVideo.paused) {
                                inlineVideo.currentTime = currentTime;
                                inlineVideo.play().catch(() => {});
                            }
                            modal.removeEventListener('transitionend', onceClose);
                        };
                        // 监听模态框关闭动画结束
                        modal.addEventListener('transitionend', onceClose, { once: true });
                    }
                });
            }
        });

        // 模态框关闭交互
        modalClose.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', closeModal);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });
    })();
    
    // 8. 自动生成视频第一帧封面（如果图片加载失败或无src）
    (function() {
        const thumbImages = document.querySelectorAll('.video-thumb[data-video-thumb]');

        thumbImages.forEach(img => {
            // 如果图片已有 src，并且浏览器能正常加载，就无需自动生成
            // 我们通过监听 error 事件来处理加载失败的情况
            img.addEventListener('error', function() {
                generateVideoThumb(img);
            });

            // 如果没有 src 或 src 为空，直接尝试生成
            if (!img.getAttribute('src') || img.getAttribute('src').trim() === '') {
                generateVideoThumb(img);
            }
        });

        function generateVideoThumb(img) {
            const videoSrc = img.getAttribute('data-video-thumb');
            if (!videoSrc) return;

            // 防止重复生成
            if (img.dataset.generating === 'true') return;
            img.dataset.generating = 'true';

            const video = document.createElement('video');
            video.src = videoSrc;
            // video.crossOrigin = 'anonymous';  // 如果涉及跨域，需要服务器支持
            video.preload = 'auto';
            video.muted = true;
            video.playsInline = true;
            video.style.display = 'none';
            document.body.appendChild(video);

            // 监听加载完成，跳转到第一帧
            video.addEventListener('loadedmetadata', function() {
                const captureTime = Math.min(0.2, video.duration * 0.1 || 0.1);
                video.currentTime = captureTime;
            });

            // 跳转完成后抓取帧
            video.addEventListener('seeked', function captureFrame() {
                video.removeEventListener('seeked', captureFrame); // 只执行一次

                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth || 640;
                    canvas.height = video.videoHeight || 360;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataURL = canvas.toDataURL('image/jpeg', 0.85);
                    img.src = dataURL;
                    img.onerror = null; // 清除之前的 error 监听，避免循环
                } catch (err) {
                    console.warn('无法生成视频封面:', videoSrc, err);
                } finally {
                    // 移除临时 video 元素
                    document.body.removeChild(video);
                }
            });

            // 视频加载出错时的处理
            video.addEventListener('error', function() {
                console.warn('视频加载失败，无法生成封面:', videoSrc);
                document.body.removeChild(video);
                img.dataset.generating = 'false';
                // 保留图片的 onerror 样式（背景色已在 HTML 中设置）
            });
        }
    })();
});
