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
