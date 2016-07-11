$(function() {
  var templates = {};
  var photos;

  $('script[type="text/x-handlebars"]').each(function() {
    var $templ = $(this);
    templates[$templ.attr('id')] = Handlebars.compile($templ.html());
  });

  $('[data-type="partial"]').each(function() {
    var $partial =$(this);
    Handlebars.registerPartial($partial.attr('id'), $partial.html());
  });

  var slideshow = {
    $el: $('#slideshow'),
    prevSlide: function(e) {
      e.preventDefault();
      var $current = this.findVisible(),
          $prev = $current.prev('figure');

      if(!$prev.length) {
        $prev = this.$el.find('figure').last(); 
      }

      $current.fadeOut();
      $prev.fadeIn();
      this.renderPhotoContent($prev.attr('data-id'));
    },

    nextSlide: function(e) {
      e.preventDefault();
      var $current = this.findVisible(),
          $next = $current.next('figure');

      if(!$next.length) {
        $next = this.$el.find('figure').first();
      }

      $current.fadeOut();
      $next.fadeIn();
      this.renderPhotoContent($next.attr('data-id'));
    },

    renderPhotoContent: function(idx) {
      $('[name=photo_id]').val(idx);
      renderPhotoInfo(+idx);
      getCommentsFor(idx);
    },

    findVisible: function() {
      return this.$el.find('figure:visible');
    },

    bind: function() {
      this.$el.find('a.prev').on('click', $.proxy(this.prevSlide, this));
      this.$el.find('a.next').on('click', $.proxy(this.nextSlide, this));
    },

    init: function() {
      this.bind()
    }
  }

  $.ajax({
    url: "/photos",
    success: function(json) {
      photos = json;
      renderPhotos();
      renderPhotoInfo(photos[0].id);
      slideshow.init();
      getCommentsFor(photos[0].id);
    },
  });

  $('header').on('click', '.actions a', function(e) {
    e.preventDefault();
    $e = $(e.currentTarget);
    $.ajax({
      url: $e.attr('href'),
      type: 'post',
      data: 'photo_id=' + $e.attr('data-id'),
      success: function(json) {
        $e.text(function(i, txt) {
          return txt.replace(/\d+/, json.total);
        });
      }
    })
  });

  $('form').on('submit', function(e) {
    e.preventDefault();
    $f = $(this);

    $.ajax({
      url: $f.attr('action'),
      type: $f.attr('method'),
      data: $f.serialize(),
      success: function(json) {
        $('#comments ul').append(templates.comment(json));
      }
    });
  });

  function renderPhotos() {
    $('#slides').html(templates.photos({ photos: photos }));    
  }

  function renderPhotoInfo(idx) {
      photo = photos.filter(function(item) {
        return item.id === idx;
      })[0];

      $('section > header').html(templates.photo_information(photo));
  }

  function getCommentsFor(idx) {
    $.ajax({
      url: '/comments',
      data: 'photo_id=' + idx,
      success: function(comments_json) {
        $('#comments ul').html(templates.comments({ comments: comments_json }));
      }
    });
  }
});