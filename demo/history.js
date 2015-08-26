(function($) {
    $(function() {
        $("#rewrite_url").on("click", function() {
            var url = $(this).attr("href");
            history.pushState({}, url, url);
            return false;
        });
    });
})(jQuery);