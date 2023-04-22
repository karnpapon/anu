use nom::branch::*;
use nom::bytes::complete::take;
use nom::combinator::{map, verify};
use nom::error::{Error, ErrorKind};
use nom::multi::many0;
use nom::sequence::*;
use nom::Err;
use nom::*;
use rosc::{OscArray, OscColor, OscMidiMessage, OscTime, OscType};

use super::token::{Color, MidiMsg, TimeMsg, Token, Tokens};
use std::result::Result::*;

#[derive(PartialEq, Debug, Clone)]
pub enum Stmt {
  ExprStmt(Expr),
}

#[derive(PartialEq, Debug, Clone)]
pub enum Expr {
  Ident(Ident),
  Lit(Literal),
  Array(Vec<Expr>),
}

#[derive(PartialEq, Debug, Clone)]
pub enum Literal {
  Int(i32),
  Long(i64),
  Float(f32),
  Double(f64),
  Bool(bool),
  String(String),
  Char(char),
  Blob(Vec<u8>),
  OscPath(String),
  Color(Color),
  MidiMsg(MidiMsg),
  TimeMsg(TimeMsg),
}

#[derive(PartialEq, Debug, Eq, Clone)]
pub struct Ident(pub String);

pub type Program = Vec<Stmt>;

pub struct Parser;

macro_rules! tag_token (
  ($func_name:ident, $tag: expr) => (
      fn $func_name(tokens: Tokens) -> IResult<Tokens, Tokens> {
          verify(take(1usize), |t: &Tokens| t.tok[0] == $tag)(tokens)
      }
  )
);

impl Parser {
  pub fn parse_tokens(tokens: Tokens) -> IResult<Tokens, Program> {
    parse_program(tokens)
  }
}

fn parse_program(input: Tokens) -> IResult<Tokens, Program> {
  terminated(many0(parse_stmt), eof_tag)(input)
}

fn parse_stmt(input: Tokens) -> IResult<Tokens, Stmt> {
  parse_expr_stmt(input)
}

fn parse_expr_stmt(input: Tokens) -> IResult<Tokens, Stmt> {
  map(parse_expr, Stmt::ExprStmt)(input)
}

fn parse_literal(input: Tokens) -> IResult<Tokens, Literal> {
  let (i1, t1) = take(1usize)(input)?;
  if t1.tok.is_empty() {
    Err(Err::Error(Error::new(input, ErrorKind::Tag)))
  } else {
    match t1.tok[0].clone() {
      Token::Long(val) => Ok((i1, Literal::Long(val))),
      Token::IntLiteral(name) => Ok((i1, Literal::Int(name))),
      Token::StringLiteral(s) => Ok((i1, Literal::String(s))),
      Token::FloatLiteral(s) => Ok((i1, Literal::Float(s))),
      Token::Double(s) => Ok((i1, Literal::Double(s))),
      Token::BoolLiteral(b) => Ok((i1, Literal::Bool(b))),
      Token::Blob(b) => Ok((i1, Literal::Blob(b))),
      Token::OSCPath(b) => Ok((i1, Literal::OscPath(b))),
      Token::Color(c) => Ok((i1, Literal::Color(c))),
      Token::Char(c) => Ok((i1, Literal::Char(c))),
      Token::MidiMessage(c) => Ok((i1, Literal::MidiMsg(c))),
      Token::TimeMsg(c) => Ok((i1, Literal::TimeMsg(c))),
      _ => Err(Err::Error(Error::new(input, ErrorKind::Tag))),
    }
  }
}
fn parse_ident(input: Tokens) -> IResult<Tokens, Ident> {
  let (i1, t1) = take(1usize)(input)?;
  if t1.tok.is_empty() {
    Err(Err::Error(Error::new(input, ErrorKind::Tag)))
  } else {
    match t1.tok[0].clone() {
      Token::Ident(name) => Ok((i1, Ident(name))),
      Token::Nil => Ok((i1, Ident("Nil".to_string()))),
      Token::Inf => Ok((i1, Ident("Inf".to_string()))),
      _ => Err(Err::Error(Error::new(input, ErrorKind::Tag))),
    }
  }
}

tag_token!(lbracket_tag, Token::LBracket);
tag_token!(rbracket_tag, Token::RBracket);
tag_token!(comma_tag, Token::Comma);
tag_token!(eof_tag, Token::EOF);

fn parse_lit_expr(input: Tokens) -> IResult<Tokens, Expr> {
  map(parse_literal, Expr::Lit)(input)
}

fn parse_ident_expr(input: Tokens) -> IResult<Tokens, Expr> {
  map(parse_ident, Expr::Ident)(input)
}

pub fn parse_atom_expr(input: Tokens) -> IResult<Tokens, Expr> {
  alt((parse_lit_expr, parse_ident_expr, parse_array_expr))(input)
}

pub fn parse_expr(input: Tokens) -> IResult<Tokens, Expr> {
  parse_pratt_expr(input)
}

fn parse_pratt_expr(input: Tokens) -> IResult<Tokens, Expr> {
  let (i1, left) = parse_atom_expr(input)?;
  go_parse_pratt_expr(i1, left)
}

fn go_parse_pratt_expr(input: Tokens, left: Expr) -> IResult<Tokens, Expr> {
  let (i1, t1) = take(1usize)(input)?;
  if t1.tok.is_empty() {
    Ok((i1, left))
  } else {
    Ok((input, left))
  }
}

fn parse_exprs(input: Tokens) -> IResult<Tokens, Vec<Expr>> {
  map(
    pair(parse_expr, many0(parse_comma_exprs)),
    |(first, second)| [&vec![first][..], &second[..]].concat(),
  )(input)
}

fn parse_comma_exprs(input: Tokens) -> IResult<Tokens, Expr> {
  preceded(comma_tag, parse_expr)(input)
}

fn empty_boxed_vec(input: Tokens) -> IResult<Tokens, Vec<Expr>> {
  Ok((input, vec![]))
}

pub fn parse_array_expr(input: Tokens) -> IResult<Tokens, Expr> {
  map(
    delimited(
      lbracket_tag,
      alt((parse_exprs, empty_boxed_vec)),
      rbracket_tag,
    ),
    Expr::Array,
  )(input)
}

pub fn parse_message(message: &Expr) -> OscType {
  match message {
    Expr::Ident(v) => parse_identity(v),
    Expr::Lit(v) => parse_scalar(v),
    Expr::Array(v) => parse_compound(v),
  }
}

fn parse_identity(message: &Ident) -> OscType {
  match message {
    Ident(val) => match val.as_ref() {
      "Nil" => OscType::Nil,
      "Inf" => OscType::Inf,
      _ => OscType::String(val.clone()),
    },
  }
}

fn parse_scalar(message: &Literal) -> OscType {
  match message {
    Literal::Long(val) => OscType::Long(*val),
    Literal::Int(val) => OscType::Int(*val),
    Literal::Float(val) => OscType::Float(*val),
    Literal::Double(val) => OscType::Double(*val),
    Literal::Bool(val) => OscType::Bool(*val),
    Literal::Blob(val) => OscType::Blob(val.clone()),
    Literal::Char(val) => OscType::Char(*val),
    Literal::String(val) => OscType::String(val.clone()),
    Literal::OscPath(val) => OscType::String(val.clone()),
    Literal::Color(Color {
      red,
      green,
      blue,
      alpha,
    }) => OscType::Color(OscColor {
      red: red.to_owned(),
      green: green.to_owned(),
      blue: blue.to_owned(),
      alpha: alpha.to_owned(),
    }),
    Literal::MidiMsg(MidiMsg {
      port,
      status,
      data1,
      data2,
    }) => OscType::Midi(OscMidiMessage {
      port: port.to_owned(),
      status: status.to_owned(),
      data1: data1.to_owned(),
      data2: data2.to_owned(),
    }),
    Literal::TimeMsg(TimeMsg {
      seconds,
      fractional,
    }) => OscType::Time(OscTime {
      seconds: seconds.to_owned(),
      fractional: fractional.to_owned(),
    }),
  }
}

fn parse_compound(message: &[Expr]) -> OscType {
  let arr = message.iter().map(parse_message).collect::<Vec<OscType>>();
  let aa = OscArray::from_iter(arr);
  OscType::Array(aa)
}
