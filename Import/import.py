# http://www.imsglobal.org/cc/index.html

folder = { 'CCCS610': 'DTDA',
           'CCCS620': 'DAM',
           'CCCS660': 'COIN' }
jupyter = set()

for m in range(1, 14):
    jupyter.add(('CCCS610', m, 'Interaction'))

gitpath = { 'CCCS610': 'DACS/blob/main/DTDA/',
            'CCCS660': 'DDDM/blob/main/COIN/' }
    
notebook = {
    'CCCS610' : {
        3: 'antennas',
        6: 'canopy',
        4: 'coloring',
        10: 'epidemic',
        12: 'flow',
        5: 'roads',
        9: 'sync',
        2: 'territory',
        7: 'words',
        1: 'snowflake',
        13: 'inventory',
        11: 'resist',
        8: 'compromise' },
    'CSSS660':
    {
        1: 'heuristic',
        3: 'towers',
        4: 'commons',
        5: 'formation', 
        6: 'perceptron',
        7: 'neural',
        8: 'sentiment',
        10: 'lanes',
        12: 'shapley'
    }
}
    

embed = {
    'glossary': '''<!DOCTYPE html>
    <html>
    <head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F8SJ1WFY9N"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-F8SJ1WFY9N');
</script>
    </head>
    <body>
    <iframe src="https://scs-technology-and-innovation.github.io/courses/TI.html" 
        allowfullscreen="allowfullscreen" height="2000px" style="width:100%;"
        frameborder="0">
</iframe>
</body>
</html>''',
    'overview': '''<!DOCTYPE html>
    <html>
        <head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F8SJ1WFY9N"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-F8SJ1WFY9N');
</script>
    </head>

    <body>
    <iframe src="https://scs-technology-and-innovation.github.io/courses/#COURSE#/overview.html" 
    allowfullscreen="allowfullscreen" 
    height="2000px" style="width:100%;"
    frameborder="0">
</iframe>
</body>
</html>''',
    
    'html': '''<!DOCTYPE html>
<html>
        <head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F8SJ1WFY9N"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-F8SJ1WFY9N');
</script>
    </head>

<body>
<iframe src="https://scs-technology-and-innovation.github.io/courses/#COURSE#/Module#MODULE#/#PART#.html" 
        allowfullscreen="allowfullscreen" height="2000px" style="width:100%;" frameborder="0"></iframe>
</body>
</html>''',
    'notebook': '''<!DOCTYPE html>
<html>
<p>
<a href="https://github.com/SCS-Technology-and-Innovation/#GITPATH##NOTEBOOK#.ipynb" target="_blank">Download 
the Jupyter Notebook file to interact on your local computer</a> 
(requires 
<a href="https://jupyter.org/install" target="_blank">installing 
the necessary software</a>).
</p>
<iframe src="https://nbviewer.org/github/SCS-Technology-and-Innovation/DACS/blob/main/DTDA/#NOTEBOOK#.ipynb" 
allowfullscreen="allowfullscreen" height="2000px" style="width:100%;" frameborder="0">
</iframe>
</body>
</html>''' }

opening = '''<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="D2L_631816" xmlns:d2l_2p0="http://desire2learn.com/xsd/d2lcp_v2p0" xmlns:scorm_1p2="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1" xmlns="http://www.imsglobal.org/xsd/imscp_v1p1">
    <metadata>
        <imsmd:lom>
            <imsmd:general>'''
intermediate = '''<imsmd:language>en-ca</imsmd:language>
            </imsmd:general>
        </imsmd:lom>
    </metadata>
    <organizations default="d2l_orgs">
        <organization identifier="d2l_org">'''

secondinter = '''
        </organization>
    </organizations>
    <resources>'''

closing = '''
    </resources>
</manifest>'''

titles = { 'CCCS 610': 'Digital Thinking for Data Analysis',
           'CCCS 620': 'Data Analysis and Modeling',
           'CCCS 660': 'Computational Intelligence' }

items = [ 'Recap', 'Introduction', 'Interaction', 'Assessment', 'Continuation' ]
files = [ 'recap', 'intro', 'interact', 'assess', 'next' ]

pairs = dict(zip(items, files))

from sys import argv

idcounter = 1
refs = []

cert = 'DACS-DDDM'

with open('imsmanifest.xml', 'w') as target:
    print(opening, file = target)
    print(f'''
    <imsmd:title>
    <imsmd:langstring xml:lang="en-ca">{cert}</imsmd:langstring>
    </imsmd:title>
    <imsmd:keyword>
    <imsmd:langstring xml:lang="en-ca">{cert}</imsmd:langstring>
    </imsmd:keyword>''', file = target)
    print(intermediate, file = target)

    for coursefull in titles:
        title = titles[coursefull]
        course = coursefull.replace(' ', '')
        number = course[-3:]
        if number in argv:
            print(f'Importing {coursefull} as requested')
        else:
            print(f'Omitting {coursefull} since it was not requested')
            continue
        
        # create the logical front matter
        print(f'<item identifier="I{idcounter}" identifierref="R{idcounter}" d2l_2p0:id="{idcounter}" description="" completion_type="2">', file = target)
        print(f'<title>{coursefull}</title>', file = target)
        refs.append(f'<resource identifier="R{idcounter}" type="webcontent" d2l_2p0:material_type="contentmodule" d2l_2p0:link_target="" href="" title="" />')
        idcounter += 1
        
        # include course overview into the front matter
        print(f'<item identifier="I{idcounter}" identifierref="R{idcounter}" d2l_2p0:id="2" d2l_2p0:resource_code="McG-4050458" description="" completion_type="2"><title>Overview | {coursefull}</title></item>', \
              file = target)
        # create the embed for the overview
        with open(f'{course}-overview.html', 'w') as html:
            content = embed['overview']
            content = content.replace('#COURSE#', folder[course]);
            print(content, file = html)        
        # reference the created embed
        refs.append(f'<resource identifier="R{idcounter}" type="webcontent" d2l_2p0:material_type="content" d2l_2p0:link_target="" href="{course}-overview.html" title="" />')
        idcounter += 1
        # close the logical front matter
        print('</item>', file = target)

        # include the modules
        for m in range(1, 14):
            # create the logical module
            module = f'{m:02}'
            print(f'<item identifier="I{idcounter}" identifierref="R{idcounter}" d2l_2p0:id="{idcounter}" description="" completion_type="2">', file = target)
            print(f'<title>Module {m} | {coursefull}</title>', file = target)
            refs.append(f'<resource identifier="R{idcounter}" type="webcontent" d2l_2p0:material_type="contentmodule" d2l_2p0:link_target="" href="" title="" />')
            idcounter += 1
            # create the elements
            for item in pairs:
                # create the submodule
                s = f'<item identifier="I{idcounter}" identifierref="R{idcounter}" d2l_2p0:id="{idcounter}" d2l_2p0:resource_code="McG-4012723" description="" completion_type="2"><title>{item} | Module {m} | {coursefull}</title></item>'
                print(s, file = target)
                # create the embed file
                htmlfilename = f'{course}-M{module}-{item}.html'
                with open(htmlfilename, 'w') as html:
                    content = embed['notebook'] if (course, m, item) in jupyter else embed['html']
                    if '#NOTEBOOK#' in content:
                        content = content.replace('#GITPATH#', gitpath[course]);
                        content = content.replace('#NOTEBOOK#', notebook[course][m]);
                    else: # COURSE MODULE PART
                        content = content.replace('#COURSE#', folder[course]);
                        content = content.replace('#MODULE#', module);
                        content = content.replace('#PART#', pairs[item]);
                    print(content, file = html)
                refs.append(f'<resource identifier="R{idcounter}" type="webcontent" d2l_2p0:material_type="content" d2l_2p0:link_target="" href="{htmlfilename}" title="" />')
                idcounter += 1
            # close the logical module
            print('</item>', file = target)

    # create the logical glossary
    print(f'<item identifier="I{idcounter}" identifierref="R{idcounter}" d2l_2p0:id="{idcounter}" description="" completion_type="2">', file = target)
    idcounter += 1                
    # include glossary content
    print(f'<item identifier="I{idcounter}" identifierref="R{idcounter}" d2l_2p0:id="2" d2l_2p0:resource_code="McG-4050458" description="" completion_type="2"><title>Glossary</title></item>', file = target)
    # create the embed file
    with open('glossary.html', 'w') as html:
        print(embed['glossary'], file = html)
    # reference the embed file of the glossary
    refs.append(f'<resource identifier="R{idcounter}" type="webcontent" d2l_2p0:material_type="content" d2l_2p0:link_target="" href="glossary.html" title="" />')
    idcounter += 1            
    # close the logical glossary
    print('</item>', file = target)
            
    # spit out the refs after all content has been listed
    print(secondinter, file = target)
    for r in refs:
        print(r, file = target)        
    print(closing, file = target);
