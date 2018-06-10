var analysis = require('react-analysis');
var NodePath = require('ast-types').NodePath
var recast = require('recast');

var b = recast.types.builders;

function JSXElementParse(jsxElement, isRootElement) {
  // console.log()
  if (jsxElement.openingElement) {
    if(isRootElement === false){
      let keyIdentifier = b.jsxIdentifier('data-frostbite-line');
      let valueLiteral = b.literal(jsxElement.openingElement.loc.start.line + '');
      let jsxElementArrt = b.jsxAttribute(keyIdentifier, valueLiteral);
      jsxElement.openingElement.attributes.push(jsxElementArrt)
  
      keyIdentifier = b.jsxIdentifier('data-frostbite-column');
      valueLiteral = b.literal(jsxElement.openingElement.loc.start.column + '');
      jsxElementArrt = b.jsxAttribute(keyIdentifier, valueLiteral);
      
      jsxElement.openingElement.attributes.push(jsxElementArrt)
    } else {
      let keyIdentifier = b.jsxIdentifier('data-frostbite-line');
      
      let propsExpress = b.memberExpression(
        b.thisExpression(),
        b.memberExpression(b.identifier('props'),b.identifier('"data-frostbite-line"'), true) // props["data-frostbite-line"]
      , false) // this.props["data-frostbite-line"]
      
      let valueLiteral = b.jsxExpressionContainer(propsExpress);
      let jsxElementArrt = b.jsxAttribute(keyIdentifier, valueLiteral);
      jsxElement.openingElement.attributes.push(jsxElementArrt)
  
      keyIdentifier = b.jsxIdentifier('data-frostbite-column');
      propsExpress = b.memberExpression(
        b.thisExpression(),
        b.memberExpression(b.identifier('props'),b.identifier('"data-frostbite-column"'), true) // props["data-frostbite-column"]
      , false) // this.props["data-frostbite-column"]
      valueLiteral = b.jsxExpressionContainer(propsExpress);
      jsxElementArrt = b.jsxAttribute(keyIdentifier, valueLiteral);
      jsxElement.openingElement.attributes.push(jsxElementArrt)


      keyIdentifier = b.jsxIdentifier('data-frostbite-component');
      valueLiteral = b.literal('true');
      jsxElementArrt = b.jsxAttribute(keyIdentifier, valueLiteral);
      jsxElement.openingElement.attributes.push(jsxElementArrt)
    }

    jsxElement.children.forEach(jsxElement => { 
      JSXElementParse(jsxElement, false)
    })
  }
}

module.exports = function (content) {
  console.log(content)
  
  try {
    let ast = analysis.getAST(content);
    let component = analysis.resolver.findExportedComponentDefinition(ast, recast);
    console.log('===================');
    // console.log(ast.program);
    // console.log(new NodePath(ast.program));
    let renderNodePath = analysis.utils.getMemberValuePath(component, 'render')
    let elementNodePath = analysis.utils.resolveFunctionDefinitionToReturnValue(renderNodePath)
    JSXElementParse(elementNodePath.node, true);
    console.log(recast.print(ast.program).code)
    // console.log(elementNodePath.node)
    return recast.print(ast.program).code;
  } catch (error) {
    console.log(error)
    return content;
  }
}
