// Header Management System
class HeaderManager {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename;
  }

  async loadHeader() {
    try {
      const response = await fetch('header.html');
      const headerHTML = await response.text();
      return headerHTML;
    } catch (error) {
      console.error('Error loading header:', error);
      return '';
    }
  }

  setActiveLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === this.currentPage || 
          (this.currentPage === 'index.html' && href === 'index.html') ||
          (this.currentPage === 'about.html' && href === 'about.html') ||
          (this.currentPage === 'passion.html' && href === 'passion.html') ||
          (this.currentPage === 'project.html' && href === 'project.html') ||
          (this.currentPage === 'contact.html' && href === 'contact.html')) {
        link.classList.add('active');
      }
    });
  }

  async init() {
    // Create header placeholder if it doesn't exist
    let headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) {
      headerPlaceholder = document.createElement('div');
      headerPlaceholder.id = 'header-placeholder';
      document.body.insertBefore(headerPlaceholder, document.body.firstChild);
    }

    // Load header HTML from file
    const headerHTML = await this.loadHeader();
    headerPlaceholder.innerHTML = headerHTML;

    // Set active link after header is loaded
    setTimeout(() => {
      this.setActiveLink();
    }, 100);

    // Initialize mobile menu functionality
    this.initMobileMenu();
  }

  initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('nav-toggle-active');
      });

      // Close mobile menu when clicking on a link
      const navLinkElements = document.querySelectorAll('.nav-link');
      navLinkElements.forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
          navToggle.classList.remove('nav-toggle-active');
        });
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
          navLinks.classList.remove('active');
          navToggle.classList.remove('nav-toggle-active');
        }
      });
    }
  }
}

// Initialize header when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new HeaderManager();
});
