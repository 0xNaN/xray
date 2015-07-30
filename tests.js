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

