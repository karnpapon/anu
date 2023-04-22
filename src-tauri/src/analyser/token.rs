use nom::{InputIter, InputLength, InputTake, Needed, Slice};
use std::iter::Enumerate;

#[derive(PartialEq, Debug, Clone)]
pub enum Token {
  Illegal,
  EOF,

  Comma,
  LBracket,
  RBracket,
  Ident(String),

  OSCPath(String),
  StringLiteral(String),
  IntLiteral(i32),
  Long(i64),
  FloatLiteral(f32),
  Double(f64),
  BoolLiteral(bool),
  Char(char),
  TimeMsg(TimeMsg),
  MidiMessage(MidiMsg),
  Color(Color),
  Blob(Vec<u8>),
  Nil,
  Inf,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Color {
  pub red: u8,
  pub green: u8,
  pub blue: u8,
  pub alpha: u8,
}

#[derive(Debug, PartialEq, Clone)]
pub struct MidiMsg {
  pub port: u8,
  pub status: u8,
  pub data1: u8,
  pub data2: u8,
}

#[derive(Debug, PartialEq, Clone)]
pub struct TimeMsg {
  pub seconds: u32,
  pub fractional: u32,
}

#[derive(Clone, Copy, PartialEq, Debug)]
#[repr(C)]
pub struct Tokens<'a> {
  pub tok: &'a [Token],
  pub start: usize,
  pub end: usize,
}

impl<'a> Tokens<'a> {
  pub fn new(vec: &'a [Token]) -> Self {
    Tokens {
      tok: vec,
      start: 0,
      end: vec.len(),
    }
  }
}

impl<'a> InputLength for Tokens<'a> {
  #[inline]
  fn input_len(&self) -> usize {
    self.tok.len()
  }
}

impl<'a> InputTake for Tokens<'a> {
  #[inline]
  fn take(&self, count: usize) -> Self {
    Tokens {
      tok: &self.tok[0..count],
      start: 0,
      end: count,
    }
  }

  #[inline]
  fn take_split(&self, count: usize) -> (Self, Self) {
    let (prefix, suffix) = self.tok.split_at(count);
    let first = Tokens {
      tok: prefix,
      start: 0,
      end: prefix.len(),
    };
    let second = Tokens {
      tok: suffix,
      start: 0,
      end: suffix.len(),
    };
    (second, first)
  }
}

impl InputLength for Token {
  #[inline]
  fn input_len(&self) -> usize {
    1
  }
}

impl<'a> InputIter for Tokens<'a> {
  type Item = &'a Token;
  type Iter = Enumerate<::std::slice::Iter<'a, Token>>;
  type IterElem = ::std::slice::Iter<'a, Token>;

  #[inline]
  fn iter_indices(&self) -> Enumerate<::std::slice::Iter<'a, Token>> {
    self.tok.iter().enumerate()
  }
  #[inline]
  fn iter_elements(&self) -> ::std::slice::Iter<'a, Token> {
    self.tok.iter()
  }
  #[inline]
  fn position<P>(&self, predicate: P) -> Option<usize>
  where
    P: Fn(Self::Item) -> bool,
  {
    self.tok.iter().position(predicate)
  }
  #[inline]
  fn slice_index(&self, count: usize) -> Result<usize, Needed> {
    if self.tok.len() >= count {
      Ok(count)
    } else {
      Err(Needed::Unknown)
    }
  }
}