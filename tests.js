QUnit.test( "ChromeSource init the table", function( assert ) {
  source = ChromeSource("");
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td></tr>" +
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process a single tag", function( assert ) {
  line = "<html>";
  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td><td class=\"line-content\"><span class=\"html-tag\">&lt;html&gt;</span></td></tr>"+
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process two tag on separate lines", function( assert ) {
  line = "<html>\n" + "<head>";

  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td><td class=\"line-content\"><span class=\"html-tag\">&lt;html&gt;</span></td></tr>"+
                       "<tr><td class=\"line-number\" value=\"2\"></td><td class=\"line-content\"><span class=\"html-tag\">&lt;head&gt;</span></td></tr>"+
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process a two tags on a line", function( assert ) {
  line = "<html><head>";
  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td><td class=\"line-content\">"+
                          "<span class=\"html-tag\">&lt;html&gt;</span>"+
                          "<span class=\"html-tag\">&lt;head&gt;</span></td></tr>"+
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process a comment on a line", function( assert ) {
  line = "<!-- a comment -->";
  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td><td class=\"line-content\">"+
                          "<span class=\"html-comment\">&lt;!-- a comment --&gt;</span></td></tr>"+
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process a comment on multiple lines", function( assert ) {
  line = "<!-- a comment on\n" +
         "multiple lines -->";
  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td><td class=\"line-content\">"+
                          "<span class=\"html-comment\">&lt;!-- a comment on</span></td></tr>"+
                       "<tr><td class=\"line-number\" value=\"2\"></td><td class=\"line-content\">"+
                          "<span class=\"html-comment\">multiple lines --&gt;</span></td></tr>"+
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process a comment containing a tag", function( assert ) {
  line = "<!-- <head> -->";
  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td><td class=\"line-content\">"+
                          "<span class=\"html-comment\">&lt;!-- &lt;head&gt; --&gt;</span></td></tr>"+
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process a comment containing a tag on mutilple lines", function( assert ) {
  line = "<!--\n"+
         "<head> -->";
  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td><td class=\"line-content\">"+
                          "<span class=\"html-comment\">&lt;!--</span></td></tr>"+
                       "<tr><td class=\"line-number\" value=\"2\"></td><td class=\"line-content\">"+
                          "<span class=\"html-comment\">&lt;head&gt; --&gt;</span></td></tr>"+
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process an empty line", function( assert ) {
  line = "<head>\n"+
         "\n"+
         "</head>";
  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td><td class=\"line-content\">"+
                          "<span class=\"html-tag\">&lt;head&gt;</span></td></tr>"+
                       "<tr><td class=\"line-number\" value=\"2\"></td></tr>"+
                       "<tr><td class=\"line-number\" value=\"3\"></td><td class=\"line-content\">"+
                          "<span class=\"html-tag\">&lt;/head&gt;</span></td></tr>"+
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process a line of plain text", function( assert ) {
  line = "plain";

  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td><td class=\"line-content\">plain</td></tr>"+
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process a complex line", function( assert ) {
  line = "\t<head>   \t simple text </head>  <!--comment-->";

  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td><td class=\"line-content\">\t<span class=\"html-tag\">&lt;head&gt;</span>"+
                       "   \t simple text <span class=\"html-tag\">&lt;/head&gt;</span>  <span class=\"html-comment\">&lt;!--comment--&gt;</span></td></tr>"+
                       "</tbody></table></body></html>");
});

QUnit.test( "ChromeSource process a tag with an attribute", function( assert ) {
  line = "<a arg=\"value\"/>";

  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td>"+
                       "<td class=\"line-content\"><span class=\"html-tag\">&lt;a <span class=\"html-attribute-name\">arg</span>"+
                       "=\"<span class=\"html-attribute-value\">value</span>\"/&gt;</span></td></tr>" +
                       "</tbody></table></body></html>");
});


QUnit.test( "ChromeSource process a tag with two attribute", function( assert ) {
  line = "<a arg=\"value\" arg=\"value2\"/>";

  source = ChromeSource(line);
  assert.equal( source, "<html><head></head><body>" +
                       "<div class=\"line-gutter-backdrop\"></div><table><tbody>" +
                       "<tr><td class=\"line-number\" value=\"1\"></td>"+
                       "<td class=\"line-content\"><span class=\"html-tag\">&lt;a "+
                        "<span class=\"html-attribute-name\">arg</span>=\"<span class=\"html-attribute-value\">value</span>\" "+
                        "<span class=\"html-attribute-name\">arg</span>=\"<span class=\"html-attribute-value\">value2</span>\"/&gt;</span></td></tr>"+
                       "</tbody></table></body></html>");
});
