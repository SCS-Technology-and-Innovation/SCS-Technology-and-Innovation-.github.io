#find . -type f -iname "*.html" -exec sed -i.bak 's#</body>#<footer><p>Copyright © <script>document.write(new Date().getFullYear());</script> McGill University</p></footer></body>#' '{}' +
#find . -type f -iname "*.html" -exec sed -i.bak 's#<TITLE>#<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"><title>#' '{}' +
#find . -type f -iname "*.html" -exec sed -i.bak 's#</HEAD>#</head><body class="content" role="document"><section class="bg-"><div class="container-fluid">    #' '{}' +
#find . -type f -iname "*.html" -exec sed -i.bak 's#</h1>#</h1><div class="info-box-grid row"><div class="info-left">&\#9432;</div><div class="info-right"><p>This module is <strong>asynchronous.</strong></p></div></div>#' '{}' +
#find . -type f -iname "*.html" -exec sed -i.bak 's#\#9432;#\&\#9432;#' '{}' +
#find . -type f -iname "*.html" -exec sed -i.bak 's#<div class="info-left"></h1>#<div class="info-left">#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#<title>#<link rel="stylesheet" href="https://mycourses2.mcgill.ca//content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/thirdpartylib/bootstrap-4.3.1/css/bootstrap.min.css"><link rel="stylesheet" href="https://mycourses2.mcgill.ca//content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/thirdpartylib/fontawesome-free-5.9.0-web/css/all.min.css"><link rel="stylesheet" href="https://mycourses2.mcgill.ca//content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/css/styles.min.css"><link rel="stylesheet" href="https://mycourses2.mcgill.ca//content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/css/custom.css"><link rel="stylesheet" href="https://mycourses2.mcgill.ca//content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/css/style-2022.css"><title>#' '{}' +


#find . -type f -iname "*.html" -exec sed -i.bak 's#</footer>#</footer><script src="https://mycourses2.mcgill.ca/content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/thirdpartylib/jquery/jquery-3.3.1.slim.min.js"></script><script src="https://mycourses2.mcgill.ca/content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/thirdpartylib/popper-js/popper.min.js"></script><script src="https://mycourses2.mcgill.ca/content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/thirdpartylib/bootstrap-4.3.1/js/bootstrap.min.js"></script><script src="https://mycourses2.mcgill.ca/content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/js/scripts.min.js"></script>#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#https://mycourses2.mcgill.ca/content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/thirdpartylib/bootstrap-4.3.1/js/bootstrap.min.js#bootstrap.min.js#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#https://mycourses2.mcgill.ca//content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/css/custom.css#custom.css#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#https://mycourses2.mcgill.ca//content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/css/style-2022.css#style-2022.css#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#https://mycourses2.mcgill.ca//content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/css/styles.min.css#styles.min.css#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#https://mycourses2.mcgill.ca//content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/thirdpartylib/fontawesome-free-5.9.0-web/css/all.min.css#all.min.css#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#<link rel="stylesheet" href="https://mycourses2.mcgill.ca//content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/thirdpartylib/bootstrap-4.3.1/css/bootstrap.min.css">##' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#<link rel="stylesheet" href="#<link rel="stylesheet" href="../../#g' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#../../../../#../../#g' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#https://mycourses2.mcgill.ca/content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/thirdpartylib/jquery/jquery-3.3.1.slim.min.js#../../jquery-3.3.1.slim.min.js#' '{}' +
#find . -type f -iname "*.html" -exec sed -i.bak 's#https://mycourses2.mcgill.ca/content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/thirdpartylib/popper-js/popper.min.js#../../popper.min.js#' '{}' +
#find . -type f -iname "*.html" -exec sed -i.bak 's#https://mycourses2.mcgill.ca/content/enforced/631816-Elisa_Schaeffer_Sandbox/scs_template_v5/_assets/js/scripts.min.js#../../scripts.min.js #' '{}' +

#ind . -type f -iname "*.html" -exec sed -i.bak 's#<footer>#</section><footer>#' '{}' +


#find . -type f -iname "*.html" -exec sed -i.bak 's#<ul>#<ul class="flex-horizontal border-none">#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#<ol>#<ul class="action-items">#' '{}' +


#find . -type f -iname "interact.html" -exec sed -i.bak 's#asynchronous#synchronous during class session but recorded for asynchronous viewing#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#<body>#<body class="content" role="document"><section class="bg-"><div class="container-fluid">#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#</ol>#</ul>#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#<h2>#<h2 class="topic-heading">#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#<strong>synchronous during class session but recorded for asynchronous viewing.</strong>#<strong>synchronous</strong> during class session, but recorded for <em>asynchronous viewing</em>.#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#<h2 class="topic-heading">Warm-up</h2>#<h1>Introduction</h1><h2 class="topic-heading">Warm-up</h2>#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#<script src="bootstrap.min.js"></script>#<script src="../../bootstrap.min.js"></script></ul>#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#</script></ul><script#</script><script#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#<a href=#<a target="_blank" href=#' '{}' +

#find . -type f -iname "*.html" -exec sed -i.bak 's#</head>##' '{}' + 

#find . -type f -iname "*.html" -exec sed -i.bak 's#${repl}##' '{}' +


find . -type f -iname "*.html" -exec sed -i.bak 's#WFY9N"); </script>#WFY9N"); </script></head>#' '{}' +


