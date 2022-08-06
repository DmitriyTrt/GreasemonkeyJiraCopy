// ==UserScript==
// @name     Jira Issue Copy UI
// @version  1
// @grant    none
// @match    https://*.atlassian.net/*
// @require  https://code.jquery.com/jquery-3.6.0.slim.min.js
// ==/UserScript==

  
(function ($) {
  
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
a.trt-copy-id,
a.trt-copy-id-n-title {
	text-decoration: none !important;
  border-radius: 5px !important;
  padding: 4px !important;
  font-size: 12px !important;
  margin-left: 5px !important;
  line-height: 1.4 !important;
  outline: none !important;
  transition: background-color 0.3s !important;
  background-color: #6B778C;
  color: white !important;
  min-width: 53px;
  text-align: center;
}

a.trt-copy-id:hover,
a.trt-copy-id-n-title:hover {
  background-color: #8993A4;
}


a.trt-copy-id.trt-successful,
a.trt-copy-id-n-title.trt-successful,
a.trt-copy-id.trt-successful:hover,
a.trt-copy-id-n-title.trt-successful:hover {
  background-color: #00875A
}
`;
  $('head')
    .append(style);
  
  $(function() {
  	var visible = false;

    $('body').on('mouseenter.trtIssueCopyUi', '#jira-issue-header', function() {
      if (visible) {
        return;
      }

      var $issueHeader = $('#jira-issue-header');
      var $issueLink = $issueHeader.find('a[href^="/browse/"]').last();

      if (!$issueLink.length) {
        return;
      }

      var links = $.parseHTML(`
  <a class="trt-copy-id" href="#">
    Copy ID
  </a>
  <a class="trt-copy-id-n-title" href="#">
    + Title
  </a>
`);
      var $links = $(links);
      
      $links.filter('.trt-copy-id').on('click', function(e) {
        e.preventDefault();
        const issueId = getIssueId($issueLink);
        copyText(issueId);
        markAsSuccessful(this);
      })
      $links.filter('.trt-copy-id-n-title').on('click', function(e) {
        e.preventDefault();
        
        var issueId = getIssueId($issueLink);

        var issueTitle = $issueHeader.parent()
          .find('h1')
          .text();
        issueTitle = $.trim(issueTitle);

        copyText(`${issueId}: ${issueTitle}`);
        markAsSuccessful(this);
      });
      
      $issueLink.after($links);
      visible = true;
    });
  });
  
  function markAsSuccessful(link) {
    const $link = $(link);
    if ($link.hasClass('trt-successful')) {
      return;
    }
    
    const text = $link.text();
    $link
      .addClass('trt-successful')
      .text('✔ Copied')
    
    setTimeout(() => {
      $link
        .removeClass('trt-successful')
        .text(text);
    }, 2000);
  }
  
  function getIssueId($issueLink) {
    const href = $issueLink.attr('href');

    const matches = href.match(/^\/browse\/([a-z0-9]+\-[0-9]+)/i)
    if (!matches) {
      throw new Error('Unable to find the issue ID.');
    }

    return matches[1];
  }

  function copyText(text) {
    navigator.clipboard.writeText(text);
  }
})(jQuery);
